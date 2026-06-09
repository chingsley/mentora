import "server-only";

import type { CalendarEntry } from "@/components/features/calendar/types";
import type { ClassDetail } from "@/components/features/class/ClassDetailsDialog";
import { offeringCapacity } from "@/lib/offeringCapacity";
import { offeringHourlyRateDisplay, teacherBillingCurrency } from "@/lib/offeringHourlyRate";
import { DEFAULT_OFFERING_RECURRENCE, recurrenceFromDb } from "@/lib/offeringRecurrence";
import { finalizeOfferingPastSessions } from "@/server/attendance";
import { listStudentEnrollments } from "@/server/enrollments";
import { getPolicy } from "@/server/policies";
import { listStudentOccurrenceMap } from "@/server/sessionOccurrence";
import type { StudentClassRow } from "@/types/studentClass";

type StudentEnrollment = Awaited<ReturnType<typeof listStudentEnrollments>>[number];

export function buildStudentClassRows(
  enrollments: StudentEnrollment[],
  globalClassCap: number,
): StudentClassRow[] {
  return enrollments.map((e) => {
    const o = e.offering;
    const capacity = offeringCapacity({
      periodType: o.periodType,
      globalClassCap,
      teacherCap: o.teacherCap,
      inviteCount: o.invites.length,
      currentEnrolled: o.enrollments.length,
    });
    const billingCurrency = teacherBillingCurrency(o.teacherProfile);

    const entry: CalendarEntry = {
      id: e.id,
      offeringId: o.id,
      title: o.title,
      subtitle: o.subject.name,
      subjectId: o.subjectId,
      dayOfWeek: o.dayOfWeek,
      startMinutes: o.startMinutes,
      endMinutes: o.endMinutes,
      enrolled: o.enrollments.length,
      effectiveCap: capacity.effectiveCap,
      recurrence: recurrenceFromDb({
        recurrenceKind: o.recurrenceKind,
        recurrenceAnchorDate: o.recurrenceAnchorDate,
        recurrenceOrdinal: o.recurrenceOrdinal,
      }),
    };

    const detail: ClassDetail = {
      offeringId: o.id,
      title: o.title,
      subjectName: o.subject.name,
      teacherName: o.teacherProfile.user.name,
      dayOfWeek: o.dayOfWeek,
      startMinutes: o.startMinutes,
      endMinutes: o.endMinutes,
      effectiveCap: capacity.effectiveCap,
      enrolled: o.enrollments.length,
      periodType: o.periodType,
      hourlyRate:
        o.hourlyRate > 0
          ? offeringHourlyRateDisplay(o.hourlyRate, billingCurrency)
          : null,
      rules: o.rules,
      description: o.description,
      recurrence: recurrenceFromDb({
        recurrenceKind: o.recurrenceKind,
        recurrenceAnchorDate: o.recurrenceAnchorDate,
        recurrenceOrdinal: o.recurrenceOrdinal,
      }),
    };

    return {
      enrollmentId: e.id,
      entry,
      detail,
      teacherName: o.teacherProfile.user.name,
    };
  });
}

async function finalizeRowsForOccurrences(rows: StudentClassRow[]) {
  const offeringsToFinalize = new Map<
    string,
    {
      offeringId: string;
      endMinutes: number;
      dayOfWeek: StudentClassRow["entry"]["dayOfWeek"];
      startMinutes: number;
      recurrence: NonNullable<StudentClassRow["entry"]["recurrence"]>;
    }
  >();

  for (const row of rows) {
    if (!offeringsToFinalize.has(row.entry.offeringId)) {
      offeringsToFinalize.set(row.entry.offeringId, {
        offeringId: row.entry.offeringId,
        endMinutes: row.entry.endMinutes,
        dayOfWeek: row.entry.dayOfWeek,
        startMinutes: row.entry.startMinutes,
        recurrence: row.entry.recurrence ?? DEFAULT_OFFERING_RECURRENCE,
      });
    }
  }

  await Promise.all(
    [...offeringsToFinalize.values()].map((o) =>
      finalizeOfferingPastSessions({
        offeringId: o.offeringId,
        endMinutes: o.endMinutes,
        dayOfWeek: o.dayOfWeek,
        startMinutes: o.startMinutes,
        recurrence: o.recurrence,
      }),
    ),
  );
}

export async function getStudentClassCalendarData(studentUserId: string) {
  const [enrollments, policy] = await Promise.all([
    listStudentEnrollments(studentUserId),
    getPolicy(),
  ]);

  const rows = buildStudentClassRows(enrollments, policy.globalClassCap);
  await finalizeRowsForOccurrences(rows);

  const occurrenceMap = await listStudentOccurrenceMap({
    enrollments: rows.map((r) => ({
      enrollmentId: r.enrollmentId,
      offeringId: r.entry.offeringId,
      startMinutes: r.entry.startMinutes,
      endMinutes: r.entry.endMinutes,
    })),
  });

  return { rows, occurrenceMap };
}
