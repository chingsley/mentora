import {
  normalizeOccurrenceSessionIso,
  sessionDateFromCalendarDate,
} from "./sessionOccurrenceKey";

describe("normalizeOccurrenceSessionIso", () => {
  it("normalizes Date and string payloads to the same occurrence key", () => {
    const calendar = new Date(2026, 5, 3);
    calendar.setHours(0, 0, 0, 0);
    const fromCalendar = sessionDateFromCalendarDate(calendar, 7 * 60 + 30).toISOString();
    const fromDate = normalizeOccurrenceSessionIso(
      sessionDateFromCalendarDate(calendar, 7 * 60 + 30),
    );
    const fromString = normalizeOccurrenceSessionIso(fromCalendar);
    expect(fromDate).toBe(fromString);
    expect(fromDate).toBe(fromCalendar);
  });
});
