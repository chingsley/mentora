export const START_HOUR = 6;
export const END_HOUR = 22;
export const SLOT_MINUTES = 30;
export const HOURS = END_HOUR - START_HOUR;
export const SLOTS = (HOURS * 60) / SLOT_MINUTES;
export const SLOT_PX = 24;

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function tileGeometry(startMinutes: number, endMinutes: number) {
  const startSlot = Math.max(0, (startMinutes - START_HOUR * 60) / SLOT_MINUTES);
  const endSlot = Math.min(SLOTS, (endMinutes - START_HOUR * 60) / SLOT_MINUTES);
  const top = startSlot * SLOT_PX;
  const height = Math.max(SLOT_PX, (endSlot - startSlot) * SLOT_PX - 2);
  return { top, height };
}
