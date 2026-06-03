import { SESSION_ATTENDANCE_EARLY_MS } from "@/constants/attendance.constants";
import { sessionDateFromCalendarDate } from "@/lib/sessionOccurrenceKey";

export const ATTENDANCE_NOT_YET_AVAILABLE_MESSAGE =
  "Attendance is not available until this session starts.";

export function sessionAttendanceOpensAt(
  calendarDate: Date,
  startMinutes: number,
): Date {
  const start = sessionDateFromCalendarDate(calendarDate, startMinutes);
  return new Date(start.getTime() - SESSION_ATTENDANCE_EARLY_MS);
}

/** True when the session is in the join window or has already started. */
export function canTakeSessionAttendance(
  calendarDate: Date,
  startMinutes: number,
  now: Date = new Date(),
): boolean {
  return now.getTime() >= sessionAttendanceOpensAt(calendarDate, startMinutes).getTime();
}

/**
 * Gate for server actions that already have the normalized occurrence key
 * (start time embedded). Avoids re-deriving calendar day + startMinutes in the
 * server timezone, which can disagree with the client-built occurrence instant.
 */
export function canTakeSessionAttendanceForOccurrence(
  occurrenceKey: Date,
  now: Date = new Date(),
): boolean {
  return now.getTime() >= occurrenceKey.getTime() - SESSION_ATTENDANCE_EARLY_MS;
}

/**
 * True when `now` falls in this occurrence's scheduled window (15 minutes before
 * start through end). Used for "live" UI on the opened session, not another date.
 */
export function isSessionInScheduledWindow(
  sessionDate: Date,
  startMinutes: number,
  endMinutes: number,
  now: Date = new Date(),
): boolean {
  const start = sessionDateFromCalendarDate(sessionDate, startMinutes);
  const end = sessionDateFromCalendarDate(sessionDate, endMinutes);
  const opensAt = start.getTime() - SESSION_ATTENDANCE_EARLY_MS;
  return now.getTime() >= opensAt && now.getTime() <= end.getTime();
}
