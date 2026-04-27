import type { DayOfWeek } from "@prisma/client";

export type CalendarView = "day" | "week" | "month";

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
}

export type FillStatus = "open" | "almost" | "full";

export function fillStatus(entry: Pick<CalendarEntry, "enrolled" | "effectiveCap">): FillStatus {
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
