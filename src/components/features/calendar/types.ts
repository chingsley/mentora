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

export const FILL_CLASSES: Record<FillStatus, string> = {
  open: "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200",
  almost: "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200",
  full: "bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200",
};

export const FILL_LABEL: Record<FillStatus, string> = {
  open: "Open",
  almost: "Almost full",
  full: "Full",
};
