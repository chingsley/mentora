import type { CalendarEntry } from "@/components/features/calendar/types";
import type { SessionMarkerKind } from "@/constants/sessionOutcome.constants";
import {
  isPastSessionEnd,
  occurrenceMapKey,
  resolveSessionMarker,
  sessionDateFromCalendarDate,
  type SessionOccurrenceSnapshot,
} from "@/lib/sessionOccurrenceKey";

export function buildCalendarOccurrenceLookup(
  map: Record<string, SessionOccurrenceSnapshot>,
): {
  map: Record<string, SessionOccurrenceSnapshot>;
  getMarker: (entry: CalendarEntry, date: Date) => SessionMarkerKind | null;
} {
  return {
    map,
    getMarker(entry, date) {
      if (!isPastSessionEnd(date, entry.endMinutes)) return null;
      const sessionDate = sessionDateFromCalendarDate(date, entry.startMinutes);
      const key = occurrenceMapKey(entry.offeringId, sessionDate);
      const snap = map[key];
      if (snap?.marker) return snap.marker;
      if (snap) {
        return resolveSessionMarker({
          outcome: snap.outcome,
          attendanceStatus: snap.attendanceStatus,
          isPast: true,
        });
      }
      return null;
    },
  };
}

export function getOccurrenceSnapshot(
  map: Record<string, SessionOccurrenceSnapshot>,
  entry: CalendarEntry,
  date: Date,
): SessionOccurrenceSnapshot | null {
  if (!isPastSessionEnd(date, entry.endMinutes)) return null;
  const sessionDate = sessionDateFromCalendarDate(date, entry.startMinutes);
  const key = occurrenceMapKey(entry.offeringId, sessionDate);
  const existing = map[key];
  if (existing) return existing;
  return {
    marker: null,
    outcome: null,
    notHeldReason: null,
    attendanceStatus: null,
    teacherNote: null,
    studentNote: null,
    teacherNoteUpdatedAtIso: null,
    studentNoteUpdatedAtIso: null,
    sessionDateIso: sessionDate.toISOString(),
  };
}
