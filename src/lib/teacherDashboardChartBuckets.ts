export interface WeekBucket {
  key: string;
  label: string;
  weekStart: Date;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Monday-start week containing `date`. */
export function startOfWeekMonday(date: Date): Date {
  const d = startOfDay(date);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function weekKey(date: Date): string {
  return startOfWeekMonday(date).toISOString().slice(0, 10);
}

/** Compact x-axis label (e.g. "Jun 8") for chart plots. */
export function formatChartAxisLabel(weekStart: Date): string {
  return weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatShortWeekLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const fmt = (value: Date) =>
    value.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(weekStart)}–${fmt(end)}`;
}

function weekOverlapsMonth(weekStart: Date, monthStart: Date, monthEnd: Date): boolean {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  return weekEnd >= monthStart && weekStart <= monthEnd;
}

/** Week buckets that intersect the given calendar month (Monday-start weeks). */
export function weekBucketsForMonth(year: number, month: number): WeekBucket[] {
  const monthStart = startOfDay(new Date(year, month, 1));
  const monthEnd = startOfDay(new Date(year, month + 1, 0));
  let cursor = startOfWeekMonday(monthStart);
  const buckets: WeekBucket[] = [];
  const seen = new Set<string>();

  for (let guard = 0; guard < 8; guard += 1) {
    const key = weekKey(cursor);
    if (!seen.has(key) && weekOverlapsMonth(cursor, monthStart, monthEnd)) {
      seen.add(key);
      buckets.push({
        key,
        label: formatShortWeekLabel(cursor),
        weekStart: new Date(cursor),
      });
    }
    cursor.setDate(cursor.getDate() + 7);
    if (cursor > monthEnd && cursor.getMonth() !== month) break;
  }

  return buckets;
}

export function weekBucketsPast(count: number, from: Date = new Date()): WeekBucket[] {
  const anchor = startOfWeekMonday(from);
  const buckets: WeekBucket[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const weekStart = new Date(anchor);
    weekStart.setDate(anchor.getDate() - i * 7);
    buckets.push({
      key: weekKey(weekStart),
      label: formatShortWeekLabel(weekStart),
      weekStart,
    });
  }
  return buckets;
}

export function weekBucketsFuture(count: number, from: Date = new Date()): WeekBucket[] {
  const anchor = startOfWeekMonday(from);
  const buckets: WeekBucket[] = [];
  for (let i = 0; i < count; i += 1) {
    const weekStart = new Date(anchor);
    weekStart.setDate(anchor.getDate() + i * 7);
    buckets.push({
      key: weekKey(weekStart),
      label: formatShortWeekLabel(weekStart),
      weekStart,
    });
  }
  return buckets;
}

export function isDateInMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}
