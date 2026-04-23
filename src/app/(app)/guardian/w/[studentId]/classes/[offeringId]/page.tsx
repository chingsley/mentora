import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { assertGuardianHasStudent } from "@/server/guardians";
import { db } from "@/lib/db";
import { getPolicy } from "@/server/policies";
import { computeCapacity } from "@/lib/capacity";
import { formatPrice, minutesToTime, DAY_LABEL } from "@/lib/time";
import {
  attendanceSummary,
  listAttendanceForEnrollment,
} from "@/server/attendance";
import { GuardianJoinObserverButton } from "./GuardianJoinObserverButton";

export const metadata: Metadata = { title: "Class details" };

interface Props {
  params: Promise<{ studentId: string; offeringId: string }>;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase() || "?";
}

export default async function WardClassDetailPage({ params }: Props) {
  const session = await requireRole("GUARDIAN");
  const { studentId, offeringId } = await params;
  await assertGuardianHasStudent(session.user.id, studentId);

  const [enrollment, policy] = await Promise.all([
    db.enrollment.findFirst({
      where: { studentProfileId: studentId, offeringId, status: "ACTIVE" },
      include: {
        offering: {
          include: {
            subject: true,
            teacherProfile: {
              include: {
                user: { select: { id: true, name: true, image: true, region: true } },
                rates: { include: { region: true } },
                subjects: { include: { subject: true } },
              },
            },
            enrollments: { where: { status: "ACTIVE" }, select: { id: true } },
          },
        },
      },
    }),
    getPolicy(),
  ]);
  if (!enrollment) notFound();

  const o = enrollment.offering;
  const teacher = o.teacherProfile;
  const cap = computeCapacity({
    globalClassCap: policy.globalClassCap,
    teacherCap: o.teacherCap,
    currentEnrolled: o.enrollments.length,
  });
  const rate =
    teacher.rates.find((r) => r.subjectId === o.subjectId) ?? teacher.rates[0] ?? null;
  const durationMinutes = o.endMinutes - o.startMinutes;
  const hourlyPrice = rate ? formatPrice(rate.hourlyRate, rate.region.currency) : null;
  const [attendance, summary] = await Promise.all([
    listAttendanceForEnrollment(enrollment.id),
    attendanceSummary(enrollment.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/guardian/w/${studentId}`}
          className="text-sm text-muted-foreground hover:text-header hover:underline"
        >
          ← Back to timetable
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-header sm:text-3xl">{o.title}</h1>
        <p className="text-sm text-muted-foreground">
          {o.subject.name} · {DAY_LABEL[o.dayOfWeek]} · {minutesToTime(o.startMinutes)}–
          {minutesToTime(o.endMinutes)}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Class overview</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Stat label="Day" value={DAY_LABEL[o.dayOfWeek]} />
              <Stat
                label="Time"
                value={`${minutesToTime(o.startMinutes)}–${minutesToTime(o.endMinutes)}`}
              />
              <Stat label="Duration" value={formatDuration(durationMinutes)} />
              <Stat label="Hourly rate" value={hourlyPrice ? `${hourlyPrice}/hr` : "—"} />
              <Stat label="Class limit" value={cap.effectiveCap.toString()} />
              <Stat label="Enrolled" value={o.enrollments.length.toString()} />
              <Stat label="Rules" value={o.rules.trim() ? "See below" : "—"} />
              <Stat label="Description" value={o.description ? "See below" : "—"} />
            </dl>

            {o.description ? (
              <section className="mt-4">
                <h3 className="mb-1 text-sm font-semibold text-header">About this class</h3>
                <p className="whitespace-pre-wrap text-sm text-text/80">{o.description}</p>
              </section>
            ) : null}

            {o.rules.trim() ? (
              <section className="mt-4">
                <h3 className="mb-1 text-sm font-semibold text-header">Rules & expectations</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-text/80">
                  {o.rules
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                </ul>
              </section>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-header/10">
                {teacher.user.image ? (
                  <Image
                    src={teacher.user.image}
                    alt={`${teacher.user.name} profile photo`}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                    {initials(teacher.user.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-header">{teacher.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  <span aria-hidden>★</span>
                  {teacher.avgRating.toFixed(1)}{" "}
                  <span>({teacher.ratingsCount})</span>
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href={`/guardian/w/${studentId}/teachers/${teacher.id}`}
                className="inline-flex h-9 items-center justify-center rounded-md bg-header px-3 text-xs font-medium text-white hover:bg-header/90"
              >
                View teacher profile
              </Link>
              <GuardianJoinObserverButton
                enrollmentId={enrollment.id}
                offeringTitle={o.title}
                studentName={session.user.name ?? "Guardian"}
                dayOfWeek={o.dayOfWeek}
                startMinutes={o.startMinutes}
                endMinutes={o.endMinutes}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance history</CardTitle>
          <CardDescription>
            {summary.total === 0
              ? "No sessions recorded yet."
              : `${summary.attendedPct}% attended · ${summary.present} present · ${summary.late} late · ${summary.absent} absent · ${summary.excused} excused`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sessions will appear here after the student joins or the teacher marks
              attendance.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {attendance.map((row) => (
                <li key={row.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-header">
                      {row.sessionDate.toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.source === "AUTO_JOIN" ? "Auto-recorded on join" : "Marked by teacher"}
                    </p>
                  </div>
                  <StatusBadge status={row.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PRESENT: "bg-emerald-100 text-emerald-900 border-emerald-300",
    ABSENT: "bg-rose-100 text-rose-900 border-rose-300",
    LATE: "bg-amber-100 text-amber-900 border-amber-300",
    EXCUSED: "bg-sky-100 text-sky-900 border-sky-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[status] ?? ""}`}
    >
      {status.toLowerCase()}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background p-2">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-header">{value}</dd>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
