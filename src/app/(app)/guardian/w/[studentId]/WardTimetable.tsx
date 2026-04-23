"use client";

import { useRouter } from "next/navigation";
import { CalendarShell } from "@/components/features/calendar/CalendarShell";
import type { CalendarEntry } from "@/components/features/calendar/types";

export interface WardTimetableProps {
  entries: CalendarEntry[];
  studentId: string;
}

export function WardTimetable({ entries, studentId }: WardTimetableProps) {
  const router = useRouter();
  return (
    <CalendarShell
      entries={entries}
      onEntryClick={(entry) => {
        router.push(`/guardian/w/${studentId}/classes/${entry.offeringId}`);
      }}
    />
  );
}
