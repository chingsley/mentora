import type { DayOfWeek } from "@prisma/client";
import {
  slotsAndRecurrenceFromScheduleEditor,
  type OfferingScheduleEditorValue,
} from "@/lib/offeringSchedule";
import { intervalsOverlapHalfOpen } from "@/lib/scheduleOverlap";
import { minutesToTime, timeToMinutes } from "@/lib/time";

export interface ScheduleConflictSlot {
  subjectId: string;
  subjectName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
}

export interface ExistingScheduleConflictOffering {
  subjectId: string;
  subjectName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
}

function formatConflictPiece(slot: Pick<ScheduleConflictSlot, "subjectName" | "startMinutes" | "endMinutes">): string {
  return `${slot.subjectName}: ${minutesToTime(slot.startMinutes)}–${minutesToTime(slot.endMinutes)}`;
}

export function formatScheduleConflictMessage(pieces: string[]): string {
  return `This time overlaps another class — ${pieces.join("; ")}`;
}

function draftSlots(
  subjectId: string,
  subjectName: string,
  schedule: OfferingScheduleEditorValue,
): ScheduleConflictSlot[] {
  const { slots } = slotsAndRecurrenceFromScheduleEditor(schedule);
  return slots.map((slot) => ({
    subjectId,
    subjectName,
    dayOfWeek: slot.dayOfWeek,
    startMinutes: timeToMinutes(slot.startTime),
    endMinutes: timeToMinutes(slot.endTime),
  }));
}

function overlaps(a: ScheduleConflictSlot, b: ScheduleConflictSlot): boolean {
  return (
    a.dayOfWeek === b.dayOfWeek &&
    intervalsOverlapHalfOpen(a.startMinutes, a.endMinutes, b.startMinutes, b.endMinutes)
  );
}

/** Returns per-subject `slots` field errors for onboarding schedule drafts. */
export function findSetupScheduleConflicts(input: {
  subjects: { id: string; name: string }[];
  drafts: Record<string, { schedule: OfferingScheduleEditorValue } | undefined>;
  existingOfferings?: ExistingScheduleConflictOffering[];
}): Record<string, string> {
  const draftEntries = input.subjects.flatMap((subject) => {
    const draft = input.drafts[subject.id];
    if (!draft) return [];
    return draftSlots(subject.id, subject.name, draft.schedule);
  });

  const errors: Record<string, string> = {};

  function setError(subjectId: string, message: string) {
    if (!errors[subjectId]) errors[subjectId] = message;
  }

  for (let i = 0; i < draftEntries.length; i += 1) {
    for (let j = i + 1; j < draftEntries.length; j += 1) {
      const left = draftEntries[i]!;
      const right = draftEntries[j]!;
      if (!overlaps(left, right)) continue;
      const message = formatScheduleConflictMessage([formatConflictPiece(right)]);
      setError(left.subjectId, message);
      setError(right.subjectId, formatScheduleConflictMessage([formatConflictPiece(left)]));
    }
  }

  const draftSubjectIds = new Set(input.subjects.map((subject) => subject.id));

  for (const slot of draftEntries) {
    for (const existing of input.existingOfferings ?? []) {
      if (draftSubjectIds.has(existing.subjectId)) continue;
      if (existing.subjectId === slot.subjectId) continue;
      if (!overlaps(slot, existing)) continue;
      setError(
        slot.subjectId,
        formatScheduleConflictMessage([formatConflictPiece(existing)]),
      );
    }
  }

  return errors;
}
