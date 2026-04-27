import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getTeacherById } from "@/server/teachers";
import { getPolicy } from "@/server/policies";
import { listTestimonialsByTeacher } from "@/server/testimonials";
import { assertGuardianHasStudent } from "@/server/guardians";
import { computeCapacity } from "@/lib/capacity";
import { formatPrice } from "@/lib/time";
import type { CalendarEntry } from "@/components/features/calendar/types";
import { GuardianTeacherView } from "./GuardianTeacherView";

export const metadata: Metadata = { title: "Teacher profile" };

interface Props {
  params: Promise<{ studentId: string; teacherId: string }>;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase() || "?";
}

export default async function GuardianTeacherPage({ params }: Props) {
  const session = await requireRole("GUARDIAN");
  const { studentId, teacherId } = await params;
  await assertGuardianHasStudent(session.user.id, studentId);

  const [teacher, policy] = await Promise.all([
    getTeacherById(teacherId),
    getPolicy(),
  ]);
  if (!teacher) notFound();
  const testimonials = await listTestimonialsByTeacher(teacher.id);

  const entries: CalendarEntry[] = teacher.offerings.map((o) => {
    const cap = computeCapacity({
      globalClassCap: policy.globalClassCap,
      teacherCap: o.teacherCap,
      currentEnrolled: o.enrollments.length,
    });
    return {
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
  });

  const topRate = teacher.rates[0];
  const priceLabel = topRate
    ? `from ${formatPrice(topRate.hourlyRate, topRate.region.currency)}/hr`
    : null;

  return (
    <GuardianTeacherView
      studentId={studentId}
      teacherProfileId={teacher.id}
      name={teacher.user.name}
      imageUrl={teacher.user.image}
      initials={initials(teacher.user.name)}
      displayId={teacher.displayId}
      rating={teacher.avgRating}
      ratingsCount={teacher.ratingsCount}
      headline={teacher.headline ?? ""}
      bio={teacher.bio ?? ""}
      priceLabel={priceLabel}
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
