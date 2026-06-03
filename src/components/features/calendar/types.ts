import type { DayOfWeek, OfferingPeriodType } from "@prisma/client";
import type { OfferingRecurrence } from "@/lib/offeringRecurrence";
import { COLORS } from "@/constants/colors.constants";
import type { SessionMarkerKind } from "@/constants/sessionOutcome.constants";

export type CalendarView = "day" | "week" | "month";

/** How class tiles are colored on the calendar grid. */
export type CalendarTileColorMode = "capacity" | "subject";

export type CalendarEntryVisibility = "available" | "blocked";

export interface CalendarEntry {
  id: string;
  offeringId: string;
  title: string;
  subtitle?: string;
  subjectId: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  enrolled: number;
  effectiveCap: number;
  visibility?: CalendarEntryVisibility;
  periodType?: OfferingPeriodType;
  recurrence?: OfferingRecurrence;
}

export interface CalendarEntryClickMeta {
  date: Date;
}

export type CalendarEntryClickHandler = (
  entry: CalendarEntry,
  meta: CalendarEntryClickMeta,
) => void;

export interface CalendarOccurrenceLookup {
  /** Map key: `${offeringId}:${sessionDateIso}` */
  map: Record<string, import("@/lib/sessionOccurrenceKey").SessionOccurrenceSnapshot>;
  getMarker: (entry: CalendarEntry, date: Date) => SessionMarkerKind | null;
}

export type FillStatus = "open" | "almost" | "full";

export const BLOCKED_THEME = {
  bg: COLORS.CALENDAR_BLOCKED_BG,
  bgHover: COLORS.CALENDAR_BLOCKED_BG_HOVER,
  border: COLORS.CALENDAR_BLOCKED_BORDER,
  text: COLORS.CALENDAR_BLOCKED_TEXT,
} as const;

export function fillStatus(
  entry: Pick<CalendarEntry, "enrolled" | "effectiveCap" | "visibility">,
): FillStatus {
  if (entry.visibility === "blocked") return "open";
  if (entry.effectiveCap <= 0) return "open";
  const ratio = entry.enrolled / entry.effectiveCap;
  if (entry.enrolled >= entry.effectiveCap) return "full";
  if (ratio >= 0.8) return "almost";
  return "open";
}

export interface FillTheme {
  bg: string;
  bgHover: string;
  border: string;
  text: string;
}

export const FILL_THEME: Record<FillStatus, FillTheme> = {
  open: {
    bg: "#dcfce7",
    bgHover: "#bbf7d0",
    border: "#86efac",
    text: "#064e3b",
  },
  almost: {
    bg: "#fef3c7",
    bgHover: "#fde68a",
    border: "#fcd34d",
    text: "#78350f",
  },
  full: {
    bg: "#fee2e2",
    bgHover: "#fecaca",
    border: "#fca5a5",
    text: "#7f1d1d",
  },
};

export const FILL_LABEL: Record<FillStatus, string> = {
  open: "Open",
  almost: "Almost full",
  full: "Full",
};
