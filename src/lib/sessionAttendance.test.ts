import {
  canTakeSessionAttendance,
  canTakeSessionAttendanceForOccurrence,
  isSessionInScheduledWindow,
  sessionAttendanceOpensAt,
} from "@/lib/sessionAttendance";
import { sessionDateFromCalendarDate } from "@/lib/sessionOccurrenceKey";
import { SESSION_ATTENDANCE_EARLY_MS } from "@/constants/attendance.constants";

describe("canTakeSessionAttendance", () => {
  const calendarDate = new Date("2026-06-03T00:00:00");
  const startMinutes = 14 * 60;

  it("returns false before the early window opens", () => {
    const opensAt = sessionAttendanceOpensAt(calendarDate, startMinutes);
    const now = new Date(opensAt.getTime() - 60_000);
    expect(canTakeSessionAttendance(calendarDate, startMinutes, now)).toBe(false);
  });

  it("returns true at the early window boundary", () => {
    const opensAt = sessionAttendanceOpensAt(calendarDate, startMinutes);
    expect(canTakeSessionAttendance(calendarDate, startMinutes, opensAt)).toBe(true);
  });

  it("returns true after session start", () => {
    const start = new Date(calendarDate);
    start.setHours(14, 0, 0, 0);
    const now = new Date(start.getTime() + 30 * 60_000);
    expect(canTakeSessionAttendance(calendarDate, startMinutes, now)).toBe(true);
  });

  it("opens attendance SESSION_ATTENDANCE_EARLY_MS before start", () => {
    const start = new Date(calendarDate);
    start.setHours(14, 0, 0, 0);
    const opensAt = sessionAttendanceOpensAt(calendarDate, startMinutes);
    expect(start.getTime() - opensAt.getTime()).toBe(SESSION_ATTENDANCE_EARLY_MS);
  });
});

describe("canTakeSessionAttendanceForOccurrence", () => {
  it("matches calendar + startMinutes gate for the same occurrence key", () => {
    const calendarDate = new Date(2026, 5, 3);
    calendarDate.setHours(0, 0, 0, 0);
    const startMinutes = 7 * 60 + 30;
    const occurrenceKey = sessionDateFromCalendarDate(calendarDate, startMinutes);
    const opensAt = sessionAttendanceOpensAt(calendarDate, startMinutes);
    expect(canTakeSessionAttendanceForOccurrence(occurrenceKey, opensAt)).toBe(true);
    expect(
      canTakeSessionAttendanceForOccurrence(
        occurrenceKey,
        new Date(opensAt.getTime() - 60_000),
      ),
    ).toBe(false);
  });
});

describe("isSessionInScheduledWindow", () => {
  const sessionDate = new Date("2026-06-03T00:00:00");
  const startMinutes = 7 * 60 + 30;
  const endMinutes = 11 * 60 + 30;

  it("is true during the opened occurrence's scheduled window", () => {
    const now = new Date("2026-06-03T09:00:00");
    expect(
      isSessionInScheduledWindow(sessionDate, startMinutes, endMinutes, now),
    ).toBe(true);
  });

  it("is false after the occurrence end time", () => {
    const now = new Date("2026-06-03T12:00:00");
    expect(
      isSessionInScheduledWindow(sessionDate, startMinutes, endMinutes, now),
    ).toBe(false);
  });

  it("is false when viewing a past date while another day is now", () => {
    const now = new Date("2026-06-10T09:00:00");
    expect(
      isSessionInScheduledWindow(sessionDate, startMinutes, endMinutes, now),
    ).toBe(false);
  });
});
