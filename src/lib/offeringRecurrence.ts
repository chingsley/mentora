import type { DayOfWeek, OfferingRecurrenceKind } from "@prisma/client";
import { z } from "zod";
import { DAY_LABEL, DAY_ORDER } from "@/lib/time";

const DAY_TO_JS: Record<DayOfWeek, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

const JS_TO_DAY: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export interface OfferingRecurrence {
  kind: OfferingRecurrenceKind;
  anchorDate: string | null;
  ordinal: number | null;
  interval: number | null;
}

export interface OfferingRecurrenceInput {
  kind: OfferingRecurrenceKind;
  anchorDate: string;
  ordinal: number | "";
  interval: number | "";
}

export const DEFAULT_OFFERING_RECURRENCE: OfferingRecurrence = {
  kind: "WEEKLY",
  anchorDate: null,
  ordinal: null,
  interval: null,
};

export const DEFAULT_OFFERING_RECURRENCE_INPUT: OfferingRecurrenceInput = {
  kind: "WEEKLY",
  anchorDate: "",
  ordinal: "",
  interval: "",
};

export const RECURRENCE_WEEK_INTERVAL = {
  MIN: 1,
  MAX: 52,
  DEFAULT: 1,
} as const;

export type RecurrenceFrequencyId = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "ONCE";

export type MonthlyPositionId =
  | "NTH_1"
  | "NTH_2"
  | "NTH_3"
  | "NTH_4"
  | "LAST"
  | "FIRST_AND_LAST";

export type RecurrencePatternId =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY_1ST"
  | "MONTHLY_2ND"
  | "MONTHLY_3RD"
  | "MONTHLY_4TH"
  | "MONTHLY_FIRST"
  | "MONTHLY_LAST"
  | "MONTHLY_FIRST_AND_LAST"
  | "ONCE";

export const RECURRENCE_FREQUENCY_OPTIONS: ReadonlyArray<{
  id: RecurrenceFrequencyId;
  label: string;
}> = [
  { id: "WEEKLY", label: "Weekly" },
  { id: "BIWEEKLY", label: "Every 2 weeks" },
  { id: "MONTHLY", label: "Monthly" },
  { id: "ONCE", label: "One time" },
];

export const MONTHLY_POSITION_OPTIONS: ReadonlyArray<{
  id: MonthlyPositionId;
  label: string;
}> = [
  { id: "NTH_1", label: "1st" },
  { id: "NTH_2", label: "2nd" },
  { id: "NTH_3", label: "3rd" },
  { id: "NTH_4", label: "4th" },
  { id: "LAST", label: "Last" },
  { id: "FIRST_AND_LAST", label: "First & last" },
];

export interface RecurrencePatternOption {
  id: RecurrencePatternId;
  label: string;
  shortLabel: string;
}

export const RECURRENCE_PATTERN_OPTIONS: RecurrencePatternOption[] = [
  { id: "WEEKLY", label: "Every week", shortLabel: "Weekly" },
  { id: "BIWEEKLY", label: "Every 2 weeks", shortLabel: "Bi-weekly" },
  { id: "MONTHLY_1ST", label: "1st weekday of month", shortLabel: "1st of month" },
  { id: "MONTHLY_2ND", label: "2nd weekday of month", shortLabel: "2nd of month" },
  { id: "MONTHLY_3RD", label: "3rd weekday of month", shortLabel: "3rd of month" },
  { id: "MONTHLY_4TH", label: "4th weekday of month", shortLabel: "4th of month" },
  { id: "MONTHLY_FIRST", label: "First weekday of month", shortLabel: "First of month" },
  { id: "MONTHLY_LAST", label: "Last weekday of month", shortLabel: "Last of month" },
  {
    id: "MONTHLY_FIRST_AND_LAST",
    label: "First & last weekday of month",
    shortLabel: "1st & last of month",
  },
  { id: "ONCE", label: "One-time event", shortLabel: "One-time" },
];

export const offeringRecurrenceSchema = z
  .object({
    kind: z.enum([
      "WEEKLY",
      "BIWEEKLY",
      "MONTHLY_NTH",
      "MONTHLY_FIRST",
      "MONTHLY_LAST",
      "MONTHLY_FIRST_AND_LAST",
      "ONCE",
    ]),
    anchorDate: z.string().optional(),
    ordinal: z.coerce.number().int().min(1).max(4).optional(),
    interval: z.coerce.number().int().min(RECURRENCE_WEEK_INTERVAL.MIN).max(RECURRENCE_WEEK_INTERVAL.MAX).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === "BIWEEKLY" || value.kind === "ONCE") {
      if (!value.anchorDate || !/^\d{4}-\d{2}-\d{2}$/.test(value.anchorDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: value.kind === "ONCE" ? "Pick the event date" : "Pick a start date",
          path: ["anchorDate"],
        });
      }
    }
    if (value.kind === "BIWEEKLY") {
      const interval = value.interval ?? 2;
      if (interval < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Use weekly recurrence for every-week schedules",
          path: ["interval"],
        });
      }
    }
    if (value.kind === "MONTHLY_NTH" && value.ordinal == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pick which week of the month",
        path: ["ordinal"],
      });
    }
  });

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map((part) => parseInt(part, 10));
  return new Date(year!, month! - 1, day);
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000);
}

function jsDayFromEnum(dayOfWeek: DayOfWeek): number {
  return DAY_TO_JS[dayOfWeek];
}

export function dayOfWeekFromDate(date: Date): DayOfWeek {
  return JS_TO_DAY[date.getDay()]!;
}

export function nextDateForDayOfWeek(dayOfWeek: DayOfWeek, from: Date = new Date()): Date {
  const target = jsDayFromEnum(dayOfWeek);
  const candidate = startOfDay(from);
  let diff = (target - candidate.getDay() + 7) % 7;
  if (diff === 0 && candidate.getTime() < startOfDay(from).getTime()) {
    diff = 7;
  }
  candidate.setDate(candidate.getDate() + diff);
  return candidate;
}

function nthWeekdayOfMonth(
  year: number,
  month: number,
  dayOfWeek: DayOfWeek,
  ordinal: number,
): Date | null {
  const target = jsDayFromEnum(dayOfWeek);
  const first = new Date(year, month, 1);
  let diff = (target - first.getDay() + 7) % 7;
  const date = new Date(year, month, 1 + diff + (ordinal - 1) * 7);
  if (date.getMonth() !== month) return null;
  return startOfDay(date);
}

function lastWeekdayOfMonth(year: number, month: number, dayOfWeek: DayOfWeek): Date {
  const target = jsDayFromEnum(dayOfWeek);
  const last = new Date(year, month + 1, 0);
  let diff = (last.getDay() - target + 7) % 7;
  const date = new Date(year, month + 1, 0 - diff);
  return startOfDay(date);
}

export function recurrenceFromDb(args: {
  recurrenceKind: OfferingRecurrenceKind;
  recurrenceAnchorDate: Date | null;
  recurrenceOrdinal: number | null;
  recurrenceInterval?: number | null;
}): OfferingRecurrence {
  return {
    kind: args.recurrenceKind,
    anchorDate: args.recurrenceAnchorDate
      ? formatIsoDate(args.recurrenceAnchorDate)
      : null,
    ordinal: args.recurrenceOrdinal,
    interval:
      args.recurrenceKind === "BIWEEKLY" ? (args.recurrenceInterval ?? 2) : null,
  };
}

export function recurrenceToDb(recurrence: OfferingRecurrence): {
  recurrenceKind: OfferingRecurrenceKind;
  recurrenceAnchorDate: Date | null;
  recurrenceOrdinal: number | null;
  recurrenceInterval: number | null;
} {
  const needsAnchor = recurrence.kind === "BIWEEKLY" || recurrence.kind === "ONCE";
  return {
    recurrenceKind: recurrence.kind,
    recurrenceAnchorDate:
      needsAnchor && recurrence.anchorDate ? parseIsoDate(recurrence.anchorDate) : null,
    recurrenceOrdinal: recurrence.kind === "MONTHLY_NTH" ? recurrence.ordinal : null,
    recurrenceInterval:
      recurrence.kind === "BIWEEKLY" ? (recurrence.interval ?? 2) : null,
  };
}

export function recurrenceInputFromDb(args: {
  recurrenceKind: OfferingRecurrenceKind;
  recurrenceAnchorDate: Date | null;
  recurrenceOrdinal: number | null;
  recurrenceInterval?: number | null;
}): OfferingRecurrenceInput {
  const recurrence = recurrenceFromDb(args);
  return {
    kind: recurrence.kind,
    anchorDate: recurrence.anchorDate ?? "",
    ordinal: recurrence.ordinal ?? "",
    interval: recurrence.interval ?? "",
  };
}

export function recurrenceFromInput(input: OfferingRecurrenceInput): OfferingRecurrence {
  return {
    kind: input.kind,
    anchorDate: input.anchorDate.trim() ? input.anchorDate.trim() : null,
    ordinal: input.ordinal === "" ? null : input.ordinal,
    interval:
      input.kind === "BIWEEKLY"
        ? input.interval === ""
          ? 2
          : input.interval
        : null,
  };
}

export function patternToRecurrence(
  patternId: RecurrencePatternId,
  current: OfferingRecurrenceInput,
  dayOfWeek: DayOfWeek,
): OfferingRecurrenceInput {
  switch (patternId) {
    case "WEEKLY":
      return { kind: "WEEKLY", anchorDate: "", ordinal: "", interval: "" };
    case "BIWEEKLY":
      return {
        kind: "BIWEEKLY",
        anchorDate: current.anchorDate || formatIsoDate(nextDateForDayOfWeek(dayOfWeek)),
        ordinal: "",
        interval: current.interval === "" ? 2 : current.interval,
      };
    case "MONTHLY_1ST":
      return { kind: "MONTHLY_NTH", anchorDate: "", ordinal: 1, interval: "" };
    case "MONTHLY_2ND":
      return { kind: "MONTHLY_NTH", anchorDate: "", ordinal: 2, interval: "" };
    case "MONTHLY_3RD":
      return { kind: "MONTHLY_NTH", anchorDate: "", ordinal: 3, interval: "" };
    case "MONTHLY_4TH":
      return { kind: "MONTHLY_NTH", anchorDate: "", ordinal: 4, interval: "" };
    case "MONTHLY_FIRST":
      return { kind: "MONTHLY_FIRST", anchorDate: "", ordinal: "", interval: "" };
    case "MONTHLY_LAST":
      return { kind: "MONTHLY_LAST", anchorDate: "", ordinal: "", interval: "" };
    case "MONTHLY_FIRST_AND_LAST":
      return { kind: "MONTHLY_FIRST_AND_LAST", anchorDate: "", ordinal: "", interval: "" };
    case "ONCE":
      return {
        kind: "ONCE",
        anchorDate: current.anchorDate || formatIsoDate(nextDateForDayOfWeek(dayOfWeek)),
        ordinal: "",
        interval: "",
      };
  }
}

export function recurrenceToFrequencyView(recurrence: OfferingRecurrenceInput): {
  frequency: RecurrenceFrequencyId;
  monthlyPosition: MonthlyPositionId;
} {
  if (recurrence.kind === "WEEKLY") {
    return { frequency: "WEEKLY", monthlyPosition: "NTH_1" };
  }
  if (recurrence.kind === "BIWEEKLY") {
    return { frequency: "BIWEEKLY", monthlyPosition: "NTH_1" };
  }
  if (recurrence.kind === "ONCE") {
    return { frequency: "ONCE", monthlyPosition: "NTH_1" };
  }
  if (recurrence.kind === "MONTHLY_LAST") {
    return { frequency: "MONTHLY", monthlyPosition: "LAST" };
  }
  if (recurrence.kind === "MONTHLY_FIRST_AND_LAST") {
    return { frequency: "MONTHLY", monthlyPosition: "FIRST_AND_LAST" };
  }
  if (recurrence.kind === "MONTHLY_FIRST") {
    return { frequency: "MONTHLY", monthlyPosition: "NTH_1" };
  }
  if (recurrence.kind === "MONTHLY_NTH") {
    const ordinal = recurrence.ordinal === "" ? 1 : recurrence.ordinal;
    const byOrdinal: Record<number, MonthlyPositionId> = {
      1: "NTH_1",
      2: "NTH_2",
      3: "NTH_3",
      4: "NTH_4",
    };
    return { frequency: "MONTHLY", monthlyPosition: byOrdinal[ordinal] ?? "NTH_1" };
  }
  return { frequency: "WEEKLY", monthlyPosition: "NTH_1" };
}

export function frequencyViewToRecurrence(
  frequency: RecurrenceFrequencyId,
  monthlyPosition: MonthlyPositionId,
  current: OfferingRecurrenceInput,
  dayOfWeek: DayOfWeek,
): OfferingRecurrenceInput {
  switch (frequency) {
    case "WEEKLY":
      return { kind: "WEEKLY", anchorDate: "", ordinal: "", interval: "" };
    case "BIWEEKLY":
      return {
        kind: "BIWEEKLY",
        anchorDate: current.anchorDate || formatIsoDate(nextDateForDayOfWeek(dayOfWeek)),
        ordinal: "",
        interval: current.interval === "" ? 2 : current.interval,
      };
    case "ONCE":
      return {
        kind: "ONCE",
        anchorDate: current.anchorDate || formatIsoDate(nextDateForDayOfWeek(dayOfWeek)),
        ordinal: "",
        interval: "",
      };
    case "MONTHLY":
      switch (monthlyPosition) {
        case "NTH_1":
          return { kind: "MONTHLY_NTH", anchorDate: "", ordinal: 1, interval: "" };
        case "NTH_2":
          return { kind: "MONTHLY_NTH", anchorDate: "", ordinal: 2, interval: "" };
        case "NTH_3":
          return { kind: "MONTHLY_NTH", anchorDate: "", ordinal: 3, interval: "" };
        case "NTH_4":
          return { kind: "MONTHLY_NTH", anchorDate: "", ordinal: 4, interval: "" };
        case "LAST":
          return { kind: "MONTHLY_LAST", anchorDate: "", ordinal: "", interval: "" };
        case "FIRST_AND_LAST":
          return { kind: "MONTHLY_FIRST_AND_LAST", anchorDate: "", ordinal: "", interval: "" };
      }
  }
}

export function recurrenceToPattern(recurrence: OfferingRecurrenceInput): RecurrencePatternId {
  if (recurrence.kind === "MONTHLY_NTH") {
    if (recurrence.ordinal === 1) return "MONTHLY_1ST";
    if (recurrence.ordinal === 2) return "MONTHLY_2ND";
    if (recurrence.ordinal === 3) return "MONTHLY_3RD";
    if (recurrence.ordinal === 4) return "MONTHLY_4TH";
  }
  if (recurrence.kind === "WEEKLY") return "WEEKLY";
  if (recurrence.kind === "BIWEEKLY") return "BIWEEKLY";
  if (recurrence.kind === "MONTHLY_FIRST") return "MONTHLY_FIRST";
  if (recurrence.kind === "MONTHLY_LAST") return "MONTHLY_LAST";
  if (recurrence.kind === "MONTHLY_FIRST_AND_LAST") return "MONTHLY_FIRST_AND_LAST";
  return "ONCE";
}

export function offeringOccursOnDate(
  recurrence: OfferingRecurrence,
  dayOfWeek: DayOfWeek,
  date: Date,
): boolean {
  const day = startOfDay(date);
  if (dayOfWeekFromDate(day) !== dayOfWeek) return false;

  switch (recurrence.kind) {
    case "WEEKLY":
      return true;
    case "BIWEEKLY": {
      if (!recurrence.anchorDate) return false;
      const anchor = startOfDay(parseIsoDate(recurrence.anchorDate));
      const weeks = Math.floor(daysBetween(anchor, day) / 7);
      const interval = recurrence.interval ?? 2;
      return weeks >= 0 && weeks % interval === 0;
    }
    case "MONTHLY_NTH": {
      if (!recurrence.ordinal) return false;
      const nth = nthWeekdayOfMonth(
        day.getFullYear(),
        day.getMonth(),
        dayOfWeek,
        recurrence.ordinal,
      );
      return nth != null && nth.getTime() === day.getTime();
    }
    case "MONTHLY_FIRST": {
      const first = nthWeekdayOfMonth(day.getFullYear(), day.getMonth(), dayOfWeek, 1);
      return first != null && first.getTime() === day.getTime();
    }
    case "MONTHLY_LAST": {
      const last = lastWeekdayOfMonth(day.getFullYear(), day.getMonth(), dayOfWeek);
      return last.getTime() === day.getTime();
    }
    case "MONTHLY_FIRST_AND_LAST": {
      const first = nthWeekdayOfMonth(day.getFullYear(), day.getMonth(), dayOfWeek, 1);
      const last = lastWeekdayOfMonth(day.getFullYear(), day.getMonth(), dayOfWeek);
      return (
        (first != null && first.getTime() === day.getTime()) || last.getTime() === day.getTime()
      );
    }
    case "ONCE":
      return recurrence.anchorDate != null && formatIsoDate(day) === recurrence.anchorDate;
    default:
      return false;
  }
}

export function nextOfferingOccurrence(
  recurrence: OfferingRecurrence,
  dayOfWeek: DayOfWeek,
  startMinutes: number,
  from: Date = new Date(),
): Date | null {
  const cursor = startOfDay(from);

  for (let offset = 0; offset <= 800; offset += 1) {
    const candidateDay = new Date(cursor);
    candidateDay.setDate(cursor.getDate() + offset);
    if (!offeringOccursOnDate(recurrence, dayOfWeek, candidateDay)) continue;

    const occurrence = new Date(candidateDay);
    occurrence.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    if (occurrence.getTime() >= from.getTime()) return occurrence;
  }

  return null;
}

const ORDINAL_LABELS = ["1st", "2nd", "3rd", "4th"] as const;

export function formatRecurrenceLabel(
  recurrence: OfferingRecurrence,
  dayOfWeek: DayOfWeek,
): string {
  const day = DAY_LABEL[dayOfWeek];

  switch (recurrence.kind) {
    case "WEEKLY":
      return `Every ${day}`;
    case "BIWEEKLY": {
      const interval = recurrence.interval ?? 2;
      return interval === 2
        ? `Every other ${day}`
        : `Every ${interval} weeks on ${day}`;
    }
    case "MONTHLY_NTH":
      return `${ORDINAL_LABELS[(recurrence.ordinal ?? 1) - 1] ?? `${recurrence.ordinal}th`} ${day} of the month`;
    case "MONTHLY_FIRST":
      return `First ${day} of the month`;
    case "MONTHLY_LAST":
      return `Last ${day} of the month`;
    case "MONTHLY_FIRST_AND_LAST":
      return `First & last ${day} of the month`;
    case "ONCE":
      return recurrence.anchorDate
        ? `One-time · ${formatDisplayDate(recurrence.anchorDate)}`
        : "One-time event";
    default:
      return `Every ${day}`;
  }
}

function formatDisplayDate(iso: string): string {
  const date = parseIsoDate(iso);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRecurrencePatternLabel(
  patternId: RecurrencePatternId,
  dayOfWeek: DayOfWeek,
): string {
  const day = DAY_LABEL[dayOfWeek];
  switch (patternId) {
    case "WEEKLY":
      return `Every ${day}`;
    case "BIWEEKLY":
      return `Every other ${day}`;
    case "MONTHLY_1ST":
      return `1st ${day} of the month`;
    case "MONTHLY_2ND":
      return `2nd ${day} of the month`;
    case "MONTHLY_3RD":
      return `3rd ${day} of the month`;
    case "MONTHLY_4TH":
      return `4th ${day} of the month`;
    case "MONTHLY_FIRST":
      return `First ${day} of the month`;
    case "MONTHLY_LAST":
      return `Last ${day} of the month`;
    case "MONTHLY_FIRST_AND_LAST":
      return `First & last ${day} of the month`;
    case "ONCE":
      return "One-time event";
  }
}

export function recurrenceRequiresAnchorDate(kind: OfferingRecurrenceKind): boolean {
  return kind === "BIWEEKLY" || kind === "ONCE";
}

export function recurrenceIsOneTime(kind: OfferingRecurrenceKind): boolean {
  return kind === "ONCE";
}

export function calendarEntriesForDate<T extends { dayOfWeek: DayOfWeek; recurrence?: OfferingRecurrence }>(
  entries: T[],
  date: Date,
): T[] {
  return entries.filter((entry) => {
    const recurrence = entry.recurrence ?? DEFAULT_OFFERING_RECURRENCE;
    return offeringOccursOnDate(recurrence, entry.dayOfWeek, date);
  });
}

export function dayOfWeekSortIndex(dayOfWeek: DayOfWeek): number {
  return DAY_ORDER.indexOf(dayOfWeek);
}
