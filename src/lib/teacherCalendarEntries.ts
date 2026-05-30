import type { DayOfWeek, OfferingPeriodType } from "@prisma/client";
import type { CalendarEntry } from "@/components/features/calendar/types";
import { isStudentInvitedToOffering, offeringCapacity } from "@/lib/offeringCapacity";

export interface TeacherOfferingCalendarSource {
  id: string;
  title: string;
  periodType: OfferingPeriodType;
  teacherCap: number | null;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  subjectId: string;
  subject: { name: string };
  enrollments: { id: string }[];
  invites: { studentProfileId: string }[];
}

export function buildTeacherOfferingCalendarEntry(args: {
  offering: TeacherOfferingCalendarSource;
  globalClassCap: number;
  /** When set, RESERVED periods are hidden unless this student is invited. */
  viewerStudentProfileId: string | null;
}): CalendarEntry {
  const { offering, globalClassCap, viewerStudentProfileId } = args;
  const enrolled = offering.enrollments.length;
  const inviteCount = offering.invites.length;

  const isReserved = offering.periodType === "RESERVED";
  const showAsBlocked =
    isReserved &&
    viewerStudentProfileId !== null &&
    !isStudentInvitedToOffering(offering.invites, viewerStudentProfileId);

  if (showAsBlocked) {
    return {
      id: `blocked-${offering.id}`,
      offeringId: offering.id,
      title: "Blocked",
      subtitle: "Reserved time",
      subjectId: offering.subjectId,
      dayOfWeek: offering.dayOfWeek,
      startMinutes: offering.startMinutes,
      endMinutes: offering.endMinutes,
      enrolled: 0,
      effectiveCap: 0,
      visibility: "blocked",
      periodType: offering.periodType,
    };
  }

  const cap = offeringCapacity({
    periodType: offering.periodType,
    globalClassCap,
    teacherCap: offering.teacherCap,
    inviteCount,
    currentEnrolled: enrolled,
  });

  return {
    id: offering.id,
    offeringId: offering.id,
    title: offering.title,
    subtitle: offering.subject.name,
    subjectId: offering.subjectId,
    dayOfWeek: offering.dayOfWeek,
    startMinutes: offering.startMinutes,
    endMinutes: offering.endMinutes,
    enrolled,
    effectiveCap: cap.effectiveCap,
    visibility: "available",
    periodType: offering.periodType,
  };
}
