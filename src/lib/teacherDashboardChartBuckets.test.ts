import {
  startOfWeekMonday,
  weekBucketsForMonth,
  weekBucketsFuture,
  weekBucketsPast,
  weekKey,
} from "./teacherDashboardChartBuckets";

describe("teacherDashboardChartBuckets", () => {
  it("uses Monday-start week keys", () => {
    const wed = new Date(2026, 2, 11);
    expect(weekKey(wed)).toBe(startOfWeekMonday(wed).toISOString().slice(0, 10));
    expect(startOfWeekMonday(wed).getDay()).toBe(1);
  });

  it("builds past and future week buckets", () => {
    const from = new Date(2026, 2, 11);
    expect(weekBucketsPast(8, from)).toHaveLength(8);
    expect(weekBucketsFuture(4, from)).toHaveLength(4);
  });

  it("builds month week buckets", () => {
    const buckets = weekBucketsForMonth(2026, 2);
    expect(buckets.length).toBeGreaterThanOrEqual(4);
    expect(buckets.length).toBeLessThanOrEqual(6);
  });
});
