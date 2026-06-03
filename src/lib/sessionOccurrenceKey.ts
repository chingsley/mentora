import type { AttendanceStatus, SessionNotHeldReason, SessionOutcome } from "@prisma/client";
import type { SessionMarkerKind } from "@/constants/sessionOutcome.constants";

/** Normalize an occurrence timestamp to a stable key (minute precision). */
export function keyForOccurrence(occurrence: Date): Date {
  const d = new Date(occurrence);
  d.setSeconds(0, 0);
  return d;
}

/** Local calendar day (midnight) for an occurrence key returned by the API. */
export function calendarDateFromSessionKey(sessionKey: Date): Date {
  const d = new Date(sessionKey);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseAttendanceSessionDateKey(sessionDateIso: string): Date {
  return keyForOccurrence(new Date(sessionDateIso));
}

/** Stable occurrence ISO for server actions (handles Date or string from RSC payloads). */
export function normalizeOccurrenceSessionIso(value: Date | string): string {
  const iso = typeof value === "string" ? value : value.toISOString();
  return parseAttendanceSessionDateKey(iso).toISOString();
}

export function sessionDateFromCalendarDate(calendarDate: Date, startMinutes: number): Date {
  const d = new Date(calendarDate);
  d.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
  return keyForOccurrence(d);
}

export function occurrenceMapKey(offeringId: string, sessionDate: Date): string {
  return `${offeringId}:${keyForOccurrence(sessionDate).toISOString()}`;
}

export function isPastSessionEnd(
  calendarDate: Date,
  endMinutes: number,
  now: Date = new Date(),
): boolean {
  const end = sessionDateFromCalendarDate(calendarDate, endMinutes);
  return now.getTime() > end.getTime();
}

export interface SessionOccurrenceSnapshot {
  marker: SessionMarkerKind | null;
  outcome: SessionOutcome | null;
  notHeldReason: SessionNotHeldReason | null;
  attendanceStatus: AttendanceStatus | null;
  teacherNote: string | null;
  studentNote: string | null;
  teacherNoteUpdatedAtIso: string | null;
  studentNoteUpdatedAtIso: string | null;
  sessionDateIso: string;
}

export function resolveSessionMarker(args: {
  outcome: SessionOutcome | null;
  attendanceStatus: AttendanceStatus | null;
  isPast: boolean;
}): SessionMarkerKind | null {
  if (!args.isPast) return null;
  if (args.outcome === "NOT_HELD") return "not_held";
  if (!args.attendanceStatus) return null;
  switch (args.attendanceStatus) {
    case "PRESENT":
      return "attended";
    case "LATE":
      return "late";
    case "ABSENT":
      return "absent";
    case "EXCUSED":
      return "excused";
    default:
      return null;
  }
}
