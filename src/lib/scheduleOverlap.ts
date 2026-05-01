/**
 * Half-open intervals [start, end) in minutes within a day.
 * Adjacent slots do not overlap (e.g. 10:00–12:00 and 12:00–14:00).
 */
export function intervalsOverlapHalfOpen(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA;
}
