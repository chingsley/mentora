"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import { CalendarShell } from "@/components/features/calendar/CalendarShell";
import type { CalendarEntry } from "@/components/features/calendar/types";
import {
  OfferingDialog,
  type OfferingDialogSubject,
  type OfferingDialogValue,
} from "@/components/features/teacher/OfferingDialog";

export interface TeacherScheduleOffering {
  id: string;
  title: string;
  description?: string | null;
  subjectId: string;
  subjectName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  teacherCap: number;
  enrolled: number;
}

export interface TeacherScheduleClientProps {
  offerings: TeacherScheduleOffering[];
  subjects: OfferingDialogSubject[];
  globalCap: number;
}

export function TeacherScheduleClient({
  offerings,
  subjects,
  globalCap,
}: TeacherScheduleClientProps) {
  const [dialog, setDialog] = React.useState<OfferingDialogValue | null>(null);

  const entries: CalendarEntry[] = offerings.map((o) => ({
    id: o.id,
    offeringId: o.id,
    title: o.title,
    subtitle: o.subjectName,
    subjectId: o.subjectId,
    dayOfWeek: o.dayOfWeek,
    startMinutes: o.startMinutes,
    endMinutes: o.endMinutes,
    enrolled: o.enrolled,
    effectiveCap: Math.min(o.teacherCap, globalCap),
  }));

  function onEntryClick(entry: CalendarEntry) {
    const original = offerings.find((o) => o.id === entry.offeringId);
    if (!original) return;
    setDialog({
      id: original.id,
      title: original.title,
      description: original.description ?? "",
      subjectId: original.subjectId,
      dayOfWeek: original.dayOfWeek,
      startMinutes: original.startMinutes,
      endMinutes: original.endMinutes,
      teacherCap: original.teacherCap,
    });
  }

  function onEmptySlotClick(info: { dayOfWeek: DayOfWeek; minutes: number }) {
    const startMinutes = info.minutes;
    const endMinutes = Math.min(22 * 60, startMinutes + 60);
    setDialog({ dayOfWeek: info.dayOfWeek, startMinutes, endMinutes });
  }

  return (
    <>
      <CalendarShell
        entries={entries}
        onEntryClick={onEntryClick}
        onEmptySlotClick={onEmptySlotClick}
        emptyState={
          <div className="rounded-lg bg-background p-6 text-center text-sm text-muted-foreground">
            No class periods yet. Click an empty slot on the week or day view to
            add one.
          </div>
        }
      />
      <OfferingDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        subjects={subjects}
        globalCap={globalCap}
        initial={dialog}
      />
    </>
  );
}
