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
import { offeringHourlyRateDisplay, teacherBillingCurrency } from "@/lib/offeringHourlyRate";
import { recurrenceFromDb } from "@/lib/offeringRecurrence";
import {
  buildTeacherSubjectRateRows,
  formatTeacherPriceSummary,
  minVisibleOfferingHourlyRate,
} from "@/lib/teacherSubjectRateRows";
import type { CalendarEntry } from "@/components/features/calendar/types";
import type { ClassDetail } from "@/components/features/class/ClassDetailsDialog";
import { getStudentClassCalendarData } from "@/server/studentClassCalendar";
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

  const isStudent = session.user.role === "STUDENT";

  const [testimonials, myEnrollments, studentSchedule] = await Promise.all([
    listTestimonialsByTeacher(teacher.id),
    getMyStudentEnrollmentsByOffering(
      isStudent ? session.user.id : undefined,
      teacher.offerings.map((o) => o.id),
    ),
    isStudent ? getStudentClassCalendarData(session.user.id) : null,
  ]);

  const billingCurrency = teacherBillingCurrency(teacher);
  const regionName = teacher.user.region?.name ?? "";

  const entries: CalendarEntry[] = [];
  const detailsByOfferingId: Record<string, ClassDetail> = {};
  const visibleOfferingIds = new Set<string>();

  for (const o of teacher.offerings) {
    const entry = buildTeacherOfferingCalendarEntry({
      offering: o,
      globalClassCap: policy.globalClassCap,
      viewerStudentProfileId,
    });
    entries.push(entry);
    if (entry.visibility === "blocked") continue;

    visibleOfferingIds.add(o.id);

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
      hourlyRate: offeringHourlyRateDisplay(o.hourlyRate, billingCurrency),
      rules: o.rules,
      description: o.description,
      recurrence: recurrenceFromDb({
        recurrenceKind: o.recurrenceKind,
        recurrenceAnchorDate: o.recurrenceAnchorDate,
        recurrenceOrdinal: o.recurrenceOrdinal,
        scheduleStartFallback: o.createdAt,
      }),
    };
  }

  const rates = buildTeacherSubjectRateRows({
    offerings: teacher.offerings,
    visibleOfferingIds,
    currency: billingCurrency,
    regionName,
  });

  const priceSummary = formatTeacherPriceSummary(
    minVisibleOfferingHourlyRate(teacher.offerings, visibleOfferingIds),
    billingCurrency,
  );

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
      rates={rates}
      entries={entries}
      detailsByOfferingId={detailsByOfferingId}
      enrollmentByOfferingId={myEnrollments}
      viewerRole={session.user.role}
      studentSchedule={
        studentSchedule
          ? {
              rows: studentSchedule.rows,
              occurrenceMap: studentSchedule.occurrenceMap,
              studentDisplayName: session.user.name ?? "You",
            }
          : null
      }
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
