import type { DayOfWeek, OfferingRecurrenceKind } from "@prisma/client";
import { nextOccurrence } from "@/lib/recurrence";
import { recurrenceFromDb } from "@/lib/offeringRecurrence";
import { DAY_LABEL } from "@/lib/time";

export interface OfferingScheduleFields {
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  recurrenceKind: OfferingRecurrenceKind;
  recurrenceAnchorDate: Date | null;
  recurrenceOrdinal: number | null;
  recurrenceInterval?: number | null;
  createdAt: Date;
}

export function formatTimeAmPm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function sessionLabel(day: DayOfWeek, startMinutes: number): string {
  return `${DAY_LABEL[day]} · ${formatTimeAmPm(startMinutes)}`;
}

export function nextOfferingOccurrenceAt(
  offering: OfferingScheduleFields,
  from: Date = new Date(),
): Date {
  const recurrence = recurrenceFromDb({
    recurrenceKind: offering.recurrenceKind,
    recurrenceAnchorDate: offering.recurrenceAnchorDate,
    recurrenceOrdinal: offering.recurrenceOrdinal,
    recurrenceInterval: offering.recurrenceInterval,
    scheduleStartFallback: offering.createdAt,
  });
  return nextOccurrence(offering.dayOfWeek, offering.startMinutes, from, recurrence);
}

export function occurrenceDisplayParts(at: Date): { monthShort: string; day: string } {
  return {
    monthShort: at.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(at.getDate()),
  };
}

export function nextOccurrenceParts(day: DayOfWeek, startMinutes: number): { monthShort: string; day: string } {
  return occurrenceDisplayParts(nextOccurrence(day, startMinutes));
}

export function sortByNextOccurrence<T extends OfferingScheduleFields>(
  items: T[],
  from: Date = new Date(),
): T[] {
  return [...items].sort(
    (a, b) =>
      nextOfferingOccurrenceAt(a, from).getTime() - nextOfferingOccurrenceAt(b, from).getTime(),
  );
}

export function daysAgo(date: Date): string {
  const ms = Date.now() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function formatDueLabel(dueAt: Date): string {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dueDay = new Date(dueAt);
  dueDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDay.getTime() - startOfToday.getTime()) / 86400000);
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due ${dueAt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
}
