import "server-only";

import type { AttendanceStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { sessionWithinEnrollment } from "@/lib/enrollmentSessionWindow";
import {
  formatChartAxisLabel,
  isDateInMonth,
  weekBucketsForMonth,
  weekBucketsPast,
  weekKey,
} from "@/lib/teacherDashboardChartBuckets";
import {
  calendarDateFromSessionKey,
  isPastSessionEnd,
  occurrenceMapKey,
} from "@/lib/sessionOccurrenceKey";
import { listTeacherBillableEnrollments } from "@/server/teacherEarnings";
import type {
  TeacherDashboardChartPoint,
  TeacherDashboardCharts,
} from "@/types/teacherDashboard";
import type { MyTeacherProfile } from "@/server/teachers";

function toChartPoint(
  bucket: { label: string; weekStart: Date },
  value: number,
  valueFormatted?: string,
): TeacherDashboardChartPoint {
  return {
    label: bucket.label,
    axisLabel: formatChartAxisLabel(bucket.weekStart),
    value,
    valueFormatted,
  };
}

function emptyCharts(currency: string): TeacherDashboardCharts {
  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const monthBuckets = weekBucketsForMonth(now.getFullYear(), now.getMonth());
  const pastBuckets = weekBucketsPast(8, now);

  return {
    currency,
    classesHeldThisMonth: {
      monthLabel,
      total: 0,
      points: monthBuckets.map((b) => toChartPoint(b, 0)),
    },
    studentAttendancePast8Weeks: {
      averageFormatted: "0%",
      points: pastBuckets.map((b) => toChartPoint(b, 0, "0%")),
    },
  };
}

function isMigrationLagError(err: unknown): boolean {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  return code === "P2021" || code === "P2022";
}

function countsTowardAttendance(status: AttendanceStatus): boolean {
  return status === "PRESENT" || status === "LATE" || status === "ABSENT";
}

function isAttended(status: AttendanceStatus): boolean {
  return status === "PRESENT" || status === "LATE";
}

export async function getTeacherDashboardCharts(
  profile: MyTeacherProfile,
): Promise<TeacherDashboardCharts> {
  const currency =
    profile.user.region?.currency ??
    profile.rates[0]?.region.currency ??
    "USD";

  const enrollments = await listTeacherBillableEnrollments(profile.id);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const monthBuckets = weekBucketsForMonth(year, month);
  const pastBuckets = weekBucketsPast(8, now);

  const classKeysByWeek = new Map(monthBuckets.map((b) => [b.key, new Set<string>()]));
  const attendanceByWeek = new Map(
    pastBuckets.map((b) => [b.key, { attended: 0, total: 0 }]),
  );

  if (enrollments.length === 0) {
    return emptyCharts(currency);
  }

  const offeringIds = [...new Set(enrollments.map((e) => e.offering.id))];
  const enrollmentIds = enrollments.map((e) => e.id);
  const endMinutesByOffering = new Map(
    enrollments.map((e) => [e.offering.id, e.offering.endMinutes]),
  );
  const enrollmentById = new Map(enrollments.map((e) => [e.id, e]));

  let occurrences: Array<{ offeringId: string; sessionDate: Date; outcome: string }> = [];
  let attendanceRows: Array<{
    enrollmentId: string;
    sessionDate: Date;
    status: AttendanceStatus;
  }> = [];

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
    return emptyCharts(currency);
  }

  const isPastOccurrence = (offeringId: string, sessionDate: Date): boolean => {
    const endMinutes = endMinutesByOffering.get(offeringId);
    if (endMinutes === undefined) return false;
    return isPastSessionEnd(calendarDateFromSessionKey(sessionDate), endMinutes, now);
  };

  const notHeldKeys = new Set<string>();
  const heldDatesByOffering = new Map<string, Date[]>();

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

  const heldClassKeysThisMonth = new Set<string>();

  for (const enrollment of enrollments) {
    const offeringId = enrollment.offering.id;
    const billableDates = (heldDatesByOffering.get(offeringId) ?? []).filter((sessionDate) =>
      sessionWithinEnrollment(sessionDate, enrollment),
    );

    for (const sessionDate of billableDates) {
      const calendarDate = calendarDateFromSessionKey(sessionDate);
      const classKey = occurrenceMapKey(offeringId, sessionDate);
      if (notHeldKeys.has(classKey)) continue;

      if (isDateInMonth(calendarDate, year, month)) {
        heldClassKeysThisMonth.add(classKey);
        classKeysByWeek.get(weekKey(calendarDate))?.add(classKey);
      }
    }
  }

  for (const row of attendanceRows) {
    const enrollment = enrollmentById.get(row.enrollmentId);
    if (!enrollment) continue;
    const offeringId = enrollment.offering.id;
    if (!isPastOccurrence(offeringId, row.sessionDate)) continue;
    if (notHeldKeys.has(occurrenceMapKey(offeringId, row.sessionDate))) continue;
    if (!sessionWithinEnrollment(row.sessionDate, enrollment)) continue;
    if (!countsTowardAttendance(row.status)) continue;

    const bucket = weekKey(row.sessionDate);
    const stats = attendanceByWeek.get(bucket);
    if (!stats) continue;
    stats.total += 1;
    if (isAttended(row.status)) stats.attended += 1;
  }

  const classesPoints = monthBuckets.map((bucket) =>
    toChartPoint(bucket, classKeysByWeek.get(bucket.key)?.size ?? 0),
  );

  let attendanceAttended = 0;
  let attendanceTotal = 0;
  const attendancePoints = pastBuckets.map((bucket) => {
    const stats = attendanceByWeek.get(bucket.key) ?? { attended: 0, total: 0 };
    attendanceAttended += stats.attended;
    attendanceTotal += stats.total;
    const pct =
      stats.total > 0 ? Math.round((stats.attended / stats.total) * 1000) / 10 : 0;
    return toChartPoint(bucket, pct, `${pct}%`);
  });

  const overallAttendancePct =
    attendanceTotal > 0
      ? Math.round((attendanceAttended / attendanceTotal) * 1000) / 10
      : 0;

  return {
    currency,
    classesHeldThisMonth: {
      monthLabel,
      total: heldClassKeysThisMonth.size,
      points: classesPoints,
    },
    studentAttendancePast8Weeks: {
      averageFormatted: `${overallAttendancePct}%`,
      points: attendancePoints,
    },
  };
}
