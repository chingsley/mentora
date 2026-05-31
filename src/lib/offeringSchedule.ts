import type { DayOfWeek, OfferingPeriodType, OfferingRecurrenceKind } from "@prisma/client";
import { DAY_ORDER, minutesToTime } from "@/lib/time";
import {
  dayOfWeekFromDate,
  formatIsoDate,
  frequencyViewToRecurrence,
  nextDateForDayOfWeek,
  parseIsoDate,
  recurrenceFromDb,
  recurrenceToFrequencyView,
  type MonthlyPositionId,
  type OfferingRecurrence,
  type OfferingRecurrenceInput,
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

export type ScheduleRepeatUnit = "week" | "month";

export interface OfferingScheduleEditorValue {
  startDate: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  repeatInterval: number;
  repeatUnit: ScheduleRepeatUnit;
  selectedDays: DayOfWeek[];
  monthlyPosition: MonthlyPositionId;
  untilDate: string;
}

export function defaultOfferingScheduleEditorValue(
  dayOfWeek: DayOfWeek = "TUE",
  startMinutes = 9 * 60,
  endMinutes = 10 * 60,
): OfferingScheduleEditorValue {
  return {
    startDate: formatIsoDate(nextDateForDayOfWeek(dayOfWeek)),
    startTime: minutesToTime(startMinutes),
    endTime: minutesToTime(endMinutes),
    isRecurring: true,
    repeatInterval: 1,
    repeatUnit: "week",
    selectedDays: [dayOfWeek],
    monthlyPosition: "NTH_1",
    untilDate: "",
  };
}

function sortSlotInputs(slots: OfferingDaySlotInput[]): OfferingDaySlotInput[] {
  return [...slots].sort(
    (a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek),
  );
}

export function scheduleEditorValueFromSlots(
  slots: OfferingDaySlotInput[],
  recurrence: OfferingRecurrenceInput,
): OfferingScheduleEditorValue {
  const orderedSlots = sortSlotInputs(slots);
  const template = orderedSlots[0] ?? defaultOfferingDaySlot("MON", 9 * 60, 10 * 60);
  const selectedDays = uniqueDaysOfWeek(orderedSlots.map((slot) => slot.dayOfWeek));
  const isRecurring = recurrence.kind !== "ONCE";
  const primaryDay = selectedDays[0] ?? template.dayOfWeek;
  const startDate =
    recurrence.anchorDate.trim() !== ""
      ? recurrence.anchorDate
      : formatIsoDate(nextDateForDayOfWeek(primaryDay));

  let repeatInterval = 1;
  let repeatUnit: ScheduleRepeatUnit = "week";
  let monthlyPosition: MonthlyPositionId = "NTH_1";

  if (recurrence.kind === "BIWEEKLY") {
    repeatInterval = recurrence.interval === "" ? 2 : recurrence.interval;
    repeatUnit = "week";
  } else {
    const { frequency, monthlyPosition: position } = recurrenceToFrequencyView(recurrence);
    if (frequency === "MONTHLY") {
      repeatUnit = "month";
      repeatInterval = 1;
      monthlyPosition = position;
    }
  }

  return {
    startDate,
    startTime: template.startTime,
    endTime: template.endTime,
    isRecurring,
    repeatInterval,
    repeatUnit,
    selectedDays: isRecurring ? selectedDays : [dayOfWeekFromDate(parseIsoDate(startDate))],
    monthlyPosition,
    untilDate: "",
  };
}

export function slotsAndRecurrenceFromScheduleEditor(value: OfferingScheduleEditorValue): {
  slots: OfferingDaySlotInput[];
  recurrence: OfferingRecurrenceInput;
} {
  const fallbackDay = dayOfWeekFromDate(
    parseIsoDate(value.startDate || formatIsoDate(new Date())),
  );
  const days =
    value.isRecurring && value.selectedDays.length > 0
      ? uniqueDaysOfWeek(value.selectedDays)
      : [fallbackDay];

  const slots = days.map((dayOfWeek) => ({
    dayOfWeek,
    startTime: value.startTime,
    endTime: value.endTime,
  }));

  let recurrence: OfferingRecurrenceInput;

  if (!value.isRecurring) {
    recurrence = {
      kind: "ONCE",
      anchorDate: value.startDate,
      ordinal: "",
      interval: "",
    };
  } else if (value.repeatUnit === "month") {
    recurrence = frequencyViewToRecurrence(
      "MONTHLY",
      value.monthlyPosition,
      { kind: "WEEKLY", anchorDate: "", ordinal: "", interval: "" },
      days[0] ?? fallbackDay,
    );
  } else if (value.repeatInterval <= 1) {
    recurrence = { kind: "WEEKLY", anchorDate: "", ordinal: "", interval: "" };
  } else {
    recurrence = {
      kind: "BIWEEKLY",
      anchorDate: value.startDate,
      ordinal: "",
      interval: value.repeatInterval,
    };
  }

  return { slots, recurrence };
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
  recurrenceInterval?: number | null;
}

export function recurrenceFromOfferingSeed(seed: OfferingDialogSeed): OfferingRecurrence {
  if (seed.recurrenceKind) {
    return recurrenceFromDb({
      recurrenceKind: seed.recurrenceKind,
      recurrenceAnchorDate: seed.recurrenceAnchorDate ?? null,
      recurrenceOrdinal: seed.recurrenceOrdinal ?? null,
      recurrenceInterval: seed.recurrenceInterval ?? null,
    });
  }
  return recurrenceFromDb({
    recurrenceKind: "WEEKLY",
    recurrenceAnchorDate: null,
    recurrenceOrdinal: null,
    recurrenceInterval: null,
  });
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
