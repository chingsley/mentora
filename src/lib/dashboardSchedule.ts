import type { DayOfWeek } from "@prisma/client";
import { DAY_LABEL, DAY_ORDER } from "@/lib/time";

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

export function nextOccurrenceParts(day: DayOfWeek, startMinutes: number): { monthShort: string; day: string } {
  const targetIdx = DAY_ORDER.indexOf(day);
  const now = new Date();
  const currentMondayFirst = (now.getDay() + 6) % 7;
  const addDays = (targetIdx - currentMondayFirst + 7) % 7;
  const at = new Date(now);
  at.setHours(0, 0, 0, 0);
  at.setDate(at.getDate() + addDays);
  const startH = Math.floor(startMinutes / 60);
  const startM = startMinutes % 60;
  at.setHours(startH, startM, 0, 0);
  if (at.getTime() <= now.getTime()) {
    at.setDate(at.getDate() + 7);
  }
  return {
    monthShort: at.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(at.getDate()),
  };
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
