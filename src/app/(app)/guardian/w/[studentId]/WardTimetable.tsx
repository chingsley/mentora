"use client";

import { useAppRouter } from "@/hooks/useAppRouter";
import { AppCalendar } from "@/components/features/calendar";
import type { CalendarEntry } from "@/components/features/calendar/types";

export interface WardTimetableProps {
  entries: CalendarEntry[];
  studentId: string;
}

export function WardTimetable({ entries, studentId }: WardTimetableProps) {
  const router = useAppRouter();
  return (
    <AppCalendar
      entries={entries}
      onEntryClick={(entry, _meta) => {
        router.push(`/guardian/w/${studentId}/classes/${entry.offeringId}`);
      }}
    />
  );
}
