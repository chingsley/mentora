export const START_HOUR = 0;
export const END_HOUR = 24;
export const HOUR_PX = 48;
export const VISIBLE_HOURS = 8;
export const VIEWPORT_HEIGHT_PX = VISIBLE_HOURS * HOUR_PX;
export const SLOT_MINUTES = 30;
export const HOURS = END_HOUR - START_HOUR;
export const SLOTS = (HOURS * 60) / SLOT_MINUTES;
export const SLOT_PX = HOUR_PX / 2;
export const GRID_HEIGHT_PX = HOURS * HOUR_PX;
export const TIME_GUTTER_WIDTH = "3.5rem";

/** @deprecated Use HOUR_PX — kept for any stale imports during migration. */
export const LEGACY_SLOT_PX = SLOT_PX;

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function minutesToGridPx(minutes: number): number {
  return ((minutes - START_HOUR * 60) / 60) * HOUR_PX;
}

export function tileGeometry(startMinutes: number, endMinutes: number) {
  const top = Math.max(0, minutesToGridPx(startMinutes));
  const bottom = Math.min(GRID_HEIGHT_PX, minutesToGridPx(endMinutes));
  const height = Math.max(SLOT_PX, bottom - top - 2);
  return { top, height };
}

export function currentTimeGridPx(now = new Date()): number | null {
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < START_HOUR * 60 || minutes >= END_HOUR * 60) return null;
  return minutesToGridPx(minutes);
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date, now = new Date()): boolean {
  return isSameCalendarDay(date, now);
}
