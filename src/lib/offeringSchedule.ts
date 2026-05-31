import type { DayOfWeek, OfferingPeriodType, OfferingRecurrenceKind } from "@prisma/client";
import { DAY_ORDER, minutesToTime } from "@/lib/time";
import {
  DEFAULT_OFFERING_RECURRENCE,
  type OfferingRecurrence,
  recurrenceFromDb,
} from "@/lib/offeringRecurrence";

export interface OfferingDaySlot {
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
}

export interface OfferingDaySlotInput {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface OfferingScheduleSource {
  id: string;
  scheduleGroupId: string | null;
  dayOfWeek: DayOfWeek;
}

export function uniqueDaysOfWeek(days: DayOfWeek[]): DayOfWeek[] {
  const seen = new Set<DayOfWeek>();
  const ordered: DayOfWeek[] = [];
  for (const day of DAY_ORDER) {
    if (days.includes(day) && !seen.has(day)) {
      seen.add(day);
      ordered.push(day);
    }
  }
  return ordered;
}

export function sortOfferingDaySlots(slots: OfferingDaySlot[]): OfferingDaySlot[] {
  return [...slots].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
  );
}

export function slotsFromMinutes(slots: OfferingDaySlot[]): OfferingDaySlotInput[] {
  return sortOfferingDaySlots(slots).map((slot) => ({
    dayOfWeek: slot.dayOfWeek,
    startTime: minutesToTime(slot.startMinutes),
    endTime: minutesToTime(slot.endMinutes),
  }));
}

export function defaultOfferingDaySlot(
  dayOfWeek: DayOfWeek,
  startMinutes: number,
  endMinutes: number,
): OfferingDaySlotInput {
  return {
    dayOfWeek,
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(endMinutes),
  };
}

export function nextUnusedDay(usedDays: DayOfWeek[]): DayOfWeek {
  return DAY_ORDER.find((day) => !usedDays.includes(day)) ?? "MON";
}

export const WEEKDAY_DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI"];

export type ScheduleDayPresetId =
  | "ONCE_WEEKLY"
  | "WEEKDAYS"
  | "MON_WED_FRI"
  | "TUE_THU"
  | "EVERY_DAY";

export interface ScheduleDayPreset {
  id: ScheduleDayPresetId;
  label: string;
  days: DayOfWeek[] | null;
}

export const SCHEDULE_DAY_PRESETS: ScheduleDayPreset[] = [
  { id: "ONCE_WEEKLY", label: "Once a week", days: null },
  { id: "WEEKDAYS", label: "Weekdays", days: WEEKDAY_DAYS },
  { id: "MON_WED_FRI", label: "Mon, Wed, Fri", days: ["MON", "WED", "FRI"] },
  { id: "TUE_THU", label: "Tue, Thu", days: ["TUE", "THU"] },
  { id: "EVERY_DAY", label: "Every day", days: DAY_ORDER },
];

function slotsShareSameTimes(slots: OfferingDaySlotInput[]): boolean {
  if (slots.length <= 1) return true;
  const { startTime, endTime } = slots[0]!;
  return slots.every((slot) => slot.startTime === startTime && slot.endTime === endTime);
}

function slotsMatchDays(slots: OfferingDaySlotInput[], days: DayOfWeek[]): boolean {
  if (slots.length !== days.length) return false;
  const slotDays = uniqueDaysOfWeek(slots.map((slot) => slot.dayOfWeek));
  return slotDays.length === days.length && days.every((day) => slotDays.includes(day));
}

export function activeScheduleDayPreset(slots: OfferingDaySlotInput[]): ScheduleDayPresetId | null {
  if (!slotsShareSameTimes(slots)) return null;

  for (const preset of SCHEDULE_DAY_PRESETS) {
    if (preset.id === "ONCE_WEEKLY") {
      if (slots.length === 1) return preset.id;
      continue;
    }
    if (preset.days && slotsMatchDays(slots, preset.days)) return preset.id;
  }

  return null;
}

export function applyScheduleDayPreset(
  currentSlots: OfferingDaySlotInput[],
  presetId: ScheduleDayPresetId,
): OfferingDaySlotInput[] {
  const template =
    currentSlots[0] ?? defaultOfferingDaySlot("MON", 9 * 60, 10 * 60);
  const { startTime, endTime } = template;

  if (presetId === "ONCE_WEEKLY") {
    return [{ dayOfWeek: template.dayOfWeek, startTime, endTime }];
  }

  const preset = SCHEDULE_DAY_PRESETS.find((row) => row.id === presetId);
  if (!preset?.days) return currentSlots;

  return preset.days.map((dayOfWeek) => ({ dayOfWeek, startTime, endTime }));
}

export function findOfferingScheduleSiblings<T extends OfferingScheduleSource>(
  offerings: T[],
  target: T,
): T[] {
  if (target.scheduleGroupId) {
    return offerings.filter((o) => o.scheduleGroupId === target.scheduleGroupId);
  }
  return [target];
}

export function scheduleGroupDays<T extends OfferingScheduleSource>(
  siblings: T[],
): DayOfWeek[] {
  return uniqueDaysOfWeek(siblings.map((o) => o.dayOfWeek));
}

export function newScheduleGroupId(): string {
  return crypto.randomUUID();
}

export function scheduleGroupIdForSlotCount(slotCount: number): string | null {
  return slotCount > 1 ? newScheduleGroupId() : null;
}

export interface OfferingDialogSeed {
  id: string;
  scheduleGroupId: string | null;
  dayOfWeek: DayOfWeek;
  title: string;
  description?: string | null;
  subjectId: string;
  startMinutes: number;
  endMinutes: number;
  periodType: OfferingPeriodType;
  teacherCap: number;
  invitedStudentProfileIds: string[];
  enrolled: number;
  recurrenceKind?: OfferingRecurrenceKind;
  recurrenceAnchorDate?: Date | null;
  recurrenceOrdinal?: number | null;
}

export function recurrenceFromOfferingSeed(seed: OfferingDialogSeed): OfferingRecurrence {
  if (seed.recurrenceKind) {
    return recurrenceFromDb({
      recurrenceKind: seed.recurrenceKind,
      recurrenceAnchorDate: seed.recurrenceAnchorDate ?? null,
      recurrenceOrdinal: seed.recurrenceOrdinal ?? null,
    });
  }
  return DEFAULT_OFFERING_RECURRENCE;
}

export function buildOfferingDialogInitial(
  target: OfferingDialogSeed,
  allOfferings: OfferingDialogSeed[],
) {
  const siblings = findOfferingScheduleSiblings(allOfferings, target);
  const slots = sortOfferingDaySlots(
    siblings.map((row) => ({
      dayOfWeek: row.dayOfWeek,
      startMinutes: row.startMinutes,
      endMinutes: row.endMinutes,
    })),
  );

  return {
    id: target.id,
    title: target.title,
    description: target.description ?? "",
    subjectId: target.subjectId,
    dayOfWeek: target.dayOfWeek,
    slots,
    scheduleGroupId: target.scheduleGroupId,
    startMinutes: target.startMinutes,
    endMinutes: target.endMinutes,
    periodType: target.periodType,
    teacherCap: target.teacherCap,
    invitedStudentProfileIds: target.invitedStudentProfileIds,
    enrolled: target.enrolled,
    groupEnrolled: siblings.reduce((total, row) => total + row.enrolled, 0),
    groupDayCount: siblings.length,
    recurrence: recurrenceFromOfferingSeed(target),
  };
}
