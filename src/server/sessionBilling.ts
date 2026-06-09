import "server-only";

import type { AttendanceStatus, SessionOutcome } from "@prisma/client";
import { db } from "@/lib/db";
import { sessionWithinEnrollment } from "@/lib/enrollmentSessionWindow";
import { formatBillableRateLabel } from "@/lib/offeringHourlyRate";
import {
  calendarDateFromSessionKey,
  isPastSessionEnd,
  occurrenceMapKey,
} from "@/lib/sessionOccurrenceKey";
import { formatPrice } from "@/lib/time";

export interface BillableOfferingTeacher {
  user: { region: { currency: string } | null };
  rates: Array<{ region: { currency: string } }>;
}

export interface BillableEnrollment {
  id: string;
  enrolledAt: Date;
  droppedAt: Date | null;
  offering: {
    id: string;
    subjectId: string;
    hourlyRate: number;
    endMinutes: number;
    subject: { name: string };
    teacherProfile: BillableOfferingTeacher;
  };
}

export interface SessionBillingSubjectLine {
  subjectId: string;
  subjectName: string;
  rateMinor: number;
  rateFormatted: string;
  sessionsCompleted: number;
  classesHeld: number;
  amountMinor: number;
  amountFormatted: string;
  present: number;
  absent: number;
  late: number;
}

export interface SessionBillingSummary {
  currency: string;
  subjects: SessionBillingSubjectLine[];
  totalSubjects: number;
  totalSessions: number;
  totalClassesHeld: number;
  totalAmountMinor: number;
  totalAmountFormatted: string;
}

function isMigrationLagError(err: unknown): boolean {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  return code === "P2021" || code === "P2022";
}

export function billableEnrollmentCurrency(enrollment: BillableEnrollment): string {
  const { offering } = enrollment;
  return (
    offering.teacherProfile.user.region?.currency ??
    offering.teacherProfile.rates[0]?.region.currency ??
    "USD"
  );
}

export function rateForBillableEnrollment(
  enrollment: BillableEnrollment,
): { hourlyRate: number; currency: string } | null {
  const { offering } = enrollment;
  if (offering.hourlyRate <= 0) return null;
  return {
    hourlyRate: offering.hourlyRate,
    currency: billableEnrollmentCurrency(enrollment),
  };
}

function emptySummary(currency: string): SessionBillingSummary {
  return {
    currency,
    subjects: [],
    totalSubjects: 0,
    totalSessions: 0,
    totalClassesHeld: 0,
    totalAmountMinor: 0,
    totalAmountFormatted: formatPrice(0, currency),
  };
}

/**
 * Billable amount = each completed (HELD, past) student-session × class hourly rate.
 * Sessions before enrollment or after drop are excluded.
 */
export async function computeSessionBilling(
  enrollments: BillableEnrollment[],
  currency: string,
): Promise<SessionBillingSummary> {
  if (enrollments.length === 0) return emptySummary(currency);

  const offeringIds = [...new Set(enrollments.map((e) => e.offering.id))];
  const enrollmentIds = enrollments.map((e) => e.id);
  const now = new Date();

  let occurrences: Array<{ offeringId: string; sessionDate: Date; outcome: SessionOutcome }> = [];
  let attendanceRows: Array<{ enrollmentId: string; sessionDate: Date; status: AttendanceStatus }> = [];
  try {
    [occurrences, attendanceRows] = await Promise.all([
      db.sessionOccurrence.findMany({
        where: { offeringId: { in: offeringIds } },
        select: { offeringId: true, sessionDate: true, outcome: true },
      }),
      db.attendance.findMany({
        where: { enrollmentId: { in: enrollmentIds } },
        select: { enrollmentId: true, sessionDate: true, status: true },
      }),
    ]);
  } catch (err) {
    if (!isMigrationLagError(err)) throw err;
    return emptySummary(currency);
  }

  const endMinutesByOffering = new Map(enrollments.map((e) => [e.offering.id, e.offering.endMinutes]));
  const enrollmentById = new Map(enrollments.map((e) => [e.id, e]));

  const isPastOccurrence = (offeringId: string, sessionDate: Date): boolean => {
    const endMinutes = endMinutesByOffering.get(offeringId);
    if (endMinutes === undefined) return false;
    return isPastSessionEnd(calendarDateFromSessionKey(sessionDate), endMinutes, now);
  };

  const heldDatesByOffering = new Map<string, Date[]>();
  const notHeldKeys = new Set<string>();
  for (const occ of occurrences) {
    if (!isPastOccurrence(occ.offeringId, occ.sessionDate)) continue;
    if (occ.outcome === "NOT_HELD") {
      notHeldKeys.add(occurrenceMapKey(occ.offeringId, occ.sessionDate));
      continue;
    }
    const dates = heldDatesByOffering.get(occ.offeringId) ?? [];
    dates.push(occ.sessionDate);
    heldDatesByOffering.set(occ.offeringId, dates);
  }

  const attendanceByEnrollment = new Map<string, { present: number; absent: number; late: number }>();
  for (const row of attendanceRows) {
    const enrollment = enrollmentById.get(row.enrollmentId);
    if (!enrollment) continue;
    const offeringId = enrollment.offering.id;
    if (!isPastOccurrence(offeringId, row.sessionDate)) continue;
    if (notHeldKeys.has(occurrenceMapKey(offeringId, row.sessionDate))) continue;
    if (!sessionWithinEnrollment(row.sessionDate, enrollment)) continue;
    const bucket = attendanceByEnrollment.get(row.enrollmentId) ?? { present: 0, absent: 0, late: 0 };
    if (row.status === "PRESENT") bucket.present += 1;
    else if (row.status === "LATE") bucket.late += 1;
    else if (row.status === "ABSENT") bucket.absent += 1;
    attendanceByEnrollment.set(row.enrollmentId, bucket);
  }

  const heldClassKeysBySubject = new Map<string, Set<string>>();
  const bySubject = new Map<
    string,
    SessionBillingSubjectLine & { minRateMinor: number; maxRateMinor: number }
  >();

  for (const e of enrollments) {
    const { offering } = e;
    const rateMinor = rateForBillableEnrollment(e)?.hourlyRate ?? 0;
    const billableDates = (heldDatesByOffering.get(offering.id) ?? []).filter((d) =>
      sessionWithinEnrollment(d, e),
    );
    const sessions = billableDates.length;
    const attendance = attendanceByEnrollment.get(e.id) ?? { present: 0, absent: 0, late: 0 };
    const amount = sessions * rateMinor;

    for (const d of billableDates) {
      const keys = heldClassKeysBySubject.get(offering.subjectId) ?? new Set<string>();
      keys.add(occurrenceMapKey(offering.id, d));
      heldClassKeysBySubject.set(offering.subjectId, keys);
    }

    const existing = bySubject.get(offering.subjectId);
    if (existing) {
      existing.sessionsCompleted += sessions;
      existing.amountMinor += amount;
      existing.present += attendance.present;
      existing.absent += attendance.absent;
      existing.late += attendance.late;
      if (rateMinor > 0) {
        existing.minRateMinor = Math.min(existing.minRateMinor, rateMinor);
        existing.maxRateMinor = Math.max(existing.maxRateMinor, rateMinor);
      }
      continue;
    }
    bySubject.set(offering.subjectId, {
      subjectId: offering.subjectId,
      subjectName: offering.subject.name,
      rateMinor,
      rateFormatted: formatPrice(rateMinor, currency),
      sessionsCompleted: sessions,
      classesHeld: 0,
      amountMinor: amount,
      amountFormatted: "",
      present: attendance.present,
      absent: attendance.absent,
      late: attendance.late,
      minRateMinor: rateMinor,
      maxRateMinor: rateMinor,
    });
  }

  const subjects = [...bySubject.values()]
    .map((s) => ({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      rateMinor: s.minRateMinor,
      rateFormatted: formatBillableRateLabel(s.minRateMinor, s.maxRateMinor, currency),
      sessionsCompleted: s.sessionsCompleted,
      classesHeld: heldClassKeysBySubject.get(s.subjectId)?.size ?? 0,
      amountMinor: s.amountMinor,
      amountFormatted: formatPrice(s.amountMinor, currency),
      present: s.present,
      absent: s.absent,
      late: s.late,
    }))
    .sort((a, b) => b.amountMinor - a.amountMinor || a.subjectName.localeCompare(b.subjectName));

  const totalSessions = subjects.reduce((sum, s) => sum + s.sessionsCompleted, 0);
  const totalClassesHeld = subjects.reduce((sum, s) => sum + s.classesHeld, 0);
  const totalAmountMinor = subjects.reduce((sum, s) => sum + s.amountMinor, 0);

  return {
    currency,
    subjects,
    totalSubjects: subjects.length,
    totalSessions,
    totalClassesHeld,
    totalAmountMinor,
    totalAmountFormatted: formatPrice(totalAmountMinor, currency),
  };
}
