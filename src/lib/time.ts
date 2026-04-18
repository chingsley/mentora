import type { DayOfWeek } from "@prisma/client";
import { minorUnitExponent, smallestToMajor } from "@/lib/money";

export const DAY_ORDER: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const DAY_LABEL: Record<DayOfWeek, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((s) => parseInt(s, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) {
    throw new Error(`Invalid time: ${time}`);
  }
  return (h ?? 0) * 60 + (m ?? 0);
}

export function formatPrice(smallestUnit: number, currency: string): string {
  const major = smallestToMajor(smallestUnit, currency);
  const fractionDigits = minorUnitExponent(currency);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: 0,
    }).format(major);
  } catch {
    return fractionDigits > 0
      ? `${major.toFixed(fractionDigits)} ${currency}`
      : `${Math.round(major)} ${currency}`;
  }
}
