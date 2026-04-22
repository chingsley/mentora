import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  getMyStudentEnrollmentsByOffering,
  getTeacherById,
} from "@/server/teachers";
import { getPolicy } from "@/server/policies";
import { listTestimonialsByTeacher } from "@/server/testimonials";
import { computeCapacity } from "@/lib/capacity";
import { formatPrice } from "@/lib/time";
import type { CalendarEntry } from "@/components/features/calendar/types";
import type { ClassDetail } from "@/components/features/class/ClassDetailsDialog";
import { TeacherPublicCalendar } from "./TeacherPublicCalendar";

export const metadata: Metadata = { title: "Teacher profile" };

interface Props {
  params: Promise<{ id: string }>;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join("").toUpperCase() || "?";
}

export default async function TeacherPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const [teacher, policy] = await Promise.all([getTeacherById(id), getPolicy()]);
  if (!teacher) notFound();

  const [testimonials, myEnrollments] = await Promise.all([
    listTestimonialsByTeacher(teacher.id),
    getMyStudentEnrollmentsByOffering(
      session.user.role === "STUDENT" ? session.user.id : undefined,
      teacher.offerings.map((o) => o.id),
    ),
  ]);

  const viewerRegionCode = session.user
    ? // fall back to teacher region
      teacher.user.region?.code ?? null
    : null;

  function findRate(subjectId: string) {
    const match =
      teacher!.rates.find(
        (r) => r.subjectId === subjectId && r.region.code === viewerRegionCode,
      ) ?? teacher!.rates.find((r) => r.subjectId === subjectId);
    return match
      ? { amount: match.hourlyRate, currency: match.region.currency }
      : null;
  }

  const testimonialsByOffering = new Map<
    string,
    ClassDetail["testimonials"]
  >();
  for (const t of testimonials) {
    const arr = testimonialsByOffering.get(t.offering.id) ?? [];
    arr.push({
      id: t.id,
      rating: t.rating,
      body: t.body,
      createdAt: t.createdAt,
      studentName: t.studentProfile.user.name,
    });
    testimonialsByOffering.set(t.offering.id, arr);
  }

  const entries: CalendarEntry[] = [];
  const detailsByOfferingId: Record<string, ClassDetail> = {};

  for (const o of teacher.offerings) {
    const cap = computeCapacity({
      globalClassCap: policy.globalClassCap,
      teacherCap: o.teacherCap,
      currentEnrolled: o.enrollments.length,
    });
    const entry: CalendarEntry = {
      id: o.id,
      offeringId: o.id,
      title: o.title,
      subtitle: o.subject.name,
      subjectId: o.subjectId,
      dayOfWeek: o.dayOfWeek,
      startMinutes: o.startMinutes,
      endMinutes: o.endMinutes,
      enrolled: o.enrollments.length,
      effectiveCap: cap.effectiveCap,
    };
    entries.push(entry);
    detailsByOfferingId[o.id] = {
      offeringId: o.id,
      title: o.title,
      subjectName: o.subject.name,
      teacherName: teacher.user.name,
      dayOfWeek: o.dayOfWeek,
      startMinutes: o.startMinutes,
      endMinutes: o.endMinutes,
      effectiveCap: cap.effectiveCap,
      enrolled: o.enrollments.length,
      hourlyRate: findRate(o.subjectId),
      rules: o.rules,
      description: o.description,
      testimonials: testimonialsByOffering.get(o.id) ?? [],
    };
  }

  const averagePriceRow = teacher.rates[0];
  const priceSummary = averagePriceRow
    ? `from ${formatPrice(averagePriceRow.hourlyRate, averagePriceRow.region.currency)}/hr`
    : "Rates coming soon";

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-header/10 sm:h-28 sm:w-28">
            {teacher.user.image ? (
              <Image
                src={teacher.user.image}
                alt={`${teacher.user.name} profile photo`}
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                {initials(teacher.user.name)}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-header sm:text-3xl">
                {teacher.user.name}
              </h1>
              <span className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-xs text-header">
                {teacher.displayId}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-header/5 px-2 py-0.5 text-xs font-medium text-header">
                <span aria-hidden>★</span>
                {teacher.avgRating.toFixed(1)}
                <span className="text-muted-foreground">
                  ({teacher.ratingsCount})
                </span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {teacher.headline || "Tutor on Mentora"}
            </p>
            <p className="text-sm font-medium text-header">{priceSummary}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {teacher.subjects.map((s) => (
                <span
                  key={s.subject.id}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text/80"
                >
                  {s.subject.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly schedule</CardTitle>
            <CardDescription>
              Tap a class to see capacity, rules and testimonies. Green tiles are
              open, amber are almost full, red are full.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="rounded-md bg-background p-4 text-sm text-muted-foreground">
                This teacher hasn&apos;t published any class periods yet.
              </p>
            ) : (
              <TeacherPublicCalendar
                entries={entries}
                detailsByOfferingId={detailsByOfferingId}
                enrollmentByOfferingId={myEnrollments}
                viewerRole={session.user.role}
                viewerName={session.user.name ?? null}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-text/80">
                {teacher.bio || "This teacher hasn't written a bio yet."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rates</CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.rates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rates set yet.</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {teacher.rates.map((r) => (
                    <li key={r.id} className="flex items-center justify-between">
                      <span className="text-text/80">
                        {r.subject.name} &middot; {r.region.name}
                      </span>
                      <span className="font-medium text-header">
                        {formatPrice(r.hourlyRate, r.region.currency)}/hr
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>
            What previous students said about classes with {teacher.user.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testimonials.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No testimonials yet.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {testimonials.slice(0, 6).map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-header">
                      {t.studentProfile.user.name}
                    </p>
                    <span
                      className="text-xs text-amber-700"
                      aria-label={`${t.rating} out of 5`}
                    >
                      {"★".repeat(t.rating)}
                      <span className="text-muted-foreground">
                        {"★".repeat(5 - t.rating)}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text/80">{t.body}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {t.offering.title}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
