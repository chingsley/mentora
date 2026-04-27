import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
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
      viewerName={session.user.name ?? null}
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
