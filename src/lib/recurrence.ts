import type { DayOfWeek } from "@prisma/client";

const DAY_TO_INDEX: Record<DayOfWeek, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

/**
 * Returns the next Date (>= `from`) when a weekly recurring class starts.
 * `startMinutes` is minutes since midnight in the local timezone.
 */
export function nextOccurrence(
  dayOfWeek: DayOfWeek,
  startMinutes: number,
  from: Date = new Date(),
): Date {
  const targetIndex = DAY_TO_INDEX[dayOfWeek];
  const fromCopy = new Date(from);

  const candidate = new Date(fromCopy);
  candidate.setHours(
    Math.floor(startMinutes / 60),
    startMinutes % 60,
    0,
    0,
  );

  let dayDiff = (targetIndex - candidate.getDay() + 7) % 7;
  if (dayDiff === 0 && candidate.getTime() < fromCopy.getTime()) {
    dayDiff = 7;
  }
  candidate.setDate(candidate.getDate() + dayDiff);
  return candidate;
}

export type ReminderStage = "T-10" | "T-0";

export interface ReminderWindow {
  stage: ReminderStage;
  fromMs: number;
  toMs: number;
}

export const T_MINUS_10_WINDOW_MS = 60 * 1000;
export const T_MINUS_0_WINDOW_MS = 30 * 1000;

export function stageForOccurrence(
  occurrence: Date,
  now: Date = new Date(),
): ReminderStage | null {
  const diffMs = occurrence.getTime() - now.getTime();
  const tenMinMs = 10 * 60 * 1000;

  if (diffMs <= tenMinMs && diffMs >= tenMinMs - T_MINUS_10_WINDOW_MS) {
    return "T-10";
  }
  if (Math.abs(diffMs) <= T_MINUS_0_WINDOW_MS) {
    return "T-0";
  }
  return null;
}
