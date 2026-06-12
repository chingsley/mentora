"use client";

import * as React from "react";
import { AppCalendar } from "@/components/features/calendar";
import type { CalendarEntry } from "@/components/features/calendar/types";

export interface TeacherPublicCalendarProps {
  entries: CalendarEntry[];
  onOfferingClick: (offeringId: string) => void;
}

export function TeacherPublicCalendar({
  entries,
  onOfferingClick,
}: TeacherPublicCalendarProps) {
  function onEntryClick(entry: CalendarEntry, _meta: { date: Date }) {
    if (entry.visibility === "blocked") return;
    onOfferingClick(entry.offeringId);
  }

  return <AppCalendar entries={entries} onEntryClick={onEntryClick} />;
}
