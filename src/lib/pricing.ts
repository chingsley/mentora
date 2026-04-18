/**
 * Mentora pricing helpers.
 *
 * All monetary amounts are represented in the **smallest unit** of the target
 * currency (kobo for NGN, cent for USD/EUR). Never use floats for money.
 */

export interface RegionMinRateRecord {
  regionCode: string;
  hourlyRate: number; // smallest unit
}

export interface TeacherRateRecord {
  regionCode: string;
  hourlyRate: number; // smallest unit
}

export interface PriceInputs {
  teacherRate: TeacherRateRecord;
  minRate: RegionMinRateRecord | null;
  /** Sum of class-period durations in minutes. */
  minutes: number;
}

export interface PriceResult {
  hourlyRate: number; // effective rate (after floor)
  minutes: number;
  total: number; // smallest unit
}

/** Round to the nearest smallest unit (avoid fractional pennies). */
function roundUnits(n: number): number {
  return Math.round(n);
}

/**
 * Compute the total price for a set of class periods, enforcing the admin's
 * per-region minimum hourly rate as a price floor.
 */
export function computePrice({ teacherRate, minRate, minutes }: PriceInputs): PriceResult {
  if (!Number.isFinite(minutes) || minutes < 0) {
    throw new RangeError("minutes must be a non-negative number");
  }
  if (minRate && minRate.regionCode !== teacherRate.regionCode) {
    throw new Error(
      `Region mismatch: teacher rate=${teacherRate.regionCode} vs min rate=${minRate.regionCode}`,
    );
  }
  const floor = minRate?.hourlyRate ?? 0;
  const hourlyRate = Math.max(teacherRate.hourlyRate, floor);
  const total = roundUnits((hourlyRate * minutes) / 60);
  return { hourlyRate, minutes, total };
}

/** Duration of a class period defined by minute offsets since 00:00. */
export function periodMinutes(startMinutes: number, endMinutes: number): number {
  if (endMinutes <= startMinutes) {
    throw new RangeError("end must be after start");
  }
  return endMinutes - startMinutes;
}

/**
 * Validate that a teacher's proposed rate is not below the region minimum.
 * Throws if invalid so callers can surface a form error.
 */
export class BelowMinimumRateError extends Error {
  constructor(minRate: number) {
    super(`Rate is below the region minimum of ${minRate}`);
    this.name = "BelowMinimumRateError";
  }
}

export function assertAtLeastMinRate(proposed: number, min: number): void {
  if (proposed < min) throw new BelowMinimumRateError(min);
}
