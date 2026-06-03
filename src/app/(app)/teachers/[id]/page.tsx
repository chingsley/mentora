import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import {
  getMyStudentEnrollmentsByOffering,
  getStudentProfileIdForUser,
  getTeacherById,
} from "@/server/teachers";
import { getPolicy } from "@/server/policies";
import { listTestimonialsByTeacher } from "@/server/testimonials";
import { offeringCapacity } from "@/lib/offeringCapacity";
import { buildTeacherOfferingCalendarEntry } from "@/lib/teacherCalendarEntries";
import { formatPrice } from "@/lib/time";
import type { CalendarEntry } from "@/components/features/calendar/types";
import type { ClassDetail } from "@/components/features/class/ClassDetailsDialog";
import { TeacherDetailView } from "./TeacherDetailView";

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

  const viewerStudentProfileId =
    session.user.role === "STUDENT"
      ? await getStudentProfileIdForUser(session.user.id)
      : null;

  const [testimonials, myEnrollments] = await Promise.all([
    listTestimonialsByTeacher(teacher.id),
    getMyStudentEnrollmentsByOffering(
      session.user.role === "STUDENT" ? session.user.id : undefined,
      teacher.offerings.map((o) => o.id),
    ),
  ]);

  const viewerRegionCode = teacher.user.region?.code ?? null;

  function findRate(subjectId: string) {
    const match =
      teacher!.rates.find(
        (r) => r.subjectId === subjectId && r.region.code === viewerRegionCode,
      ) ?? teacher!.rates.find((r) => r.subjectId === subjectId);
    return match
      ? { amount: match.hourlyRate, currency: match.region.currency }
      : null;
  }

  const entries: CalendarEntry[] = [];
  const detailsByOfferingId: Record<string, ClassDetail> = {};

  for (const o of teacher.offerings) {
    const entry = buildTeacherOfferingCalendarEntry({
      offering: o,
      globalClassCap: policy.globalClassCap,
      viewerStudentProfileId,
    });
    entries.push(entry);
    if (entry.visibility === "blocked") continue;

    const cap = offeringCapacity({
      periodType: o.periodType,
      globalClassCap: policy.globalClassCap,
      teacherCap: o.teacherCap,
      inviteCount: o.invites.length,
      currentEnrolled: o.enrollments.length,
    });
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
      periodType: o.periodType,
      hourlyRate: findRate(o.subjectId),
      rules: o.rules,
      description: o.description,
    };
  }

  const averagePriceRow = teacher.rates[0];
  const priceSummary = averagePriceRow
    ? `from ${formatPrice(averagePriceRow.hourlyRate, averagePriceRow.region.currency)}/hr`
    : "Rates coming soon";

  return (
    <TeacherDetailView
      name={teacher.user.name}
      imageUrl={teacher.user.image ?? null}
      initials={initials(teacher.user.name)}
      displayId={teacher.displayId}
      rating={teacher.avgRating}
      ratingsCount={teacher.ratingsCount}
      headline={teacher.headline}
      bio={teacher.bio}
      priceSummary={priceSummary}
      subjects={teacher.subjects.map((s) => ({
        id: s.subject.id,
        name: s.subject.name,
      }))}
      rates={teacher.rates.map((r) => ({
        id: r.id,
        subjectName: r.subject.name,
        regionName: r.region.name,
        hourlyDisplay: formatPrice(r.hourlyRate, r.region.currency),
      }))}
      entries={entries}
      detailsByOfferingId={detailsByOfferingId}
      enrollmentByOfferingId={myEnrollments}
      viewerRole={session.user.role}
      testimonials={testimonials.map((t) => ({
        id: t.id,
        studentName: t.studentProfile.user.name,
        rating: t.rating,
        body: t.body,
        offeringTitle: t.offering.title,
      }))}
    />
  );
}
