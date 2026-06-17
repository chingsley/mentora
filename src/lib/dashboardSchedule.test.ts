import type { OfferingScheduleFields } from "./dashboardSchedule";
import { nextOfferingOccurrenceAt, sortByNextOccurrence } from "./dashboardSchedule";

function weeklyOffering(
  dayOfWeek: OfferingScheduleFields["dayOfWeek"],
  startMinutes: number,
  id: string,
): OfferingScheduleFields & { id: string } {
  return {
    id,
    dayOfWeek,
    startMinutes,
    recurrenceKind: "WEEKLY",
    recurrenceAnchorDate: null,
    recurrenceOrdinal: null,
    createdAt: new Date("2026-01-01T00:00:00"),
  };
}

describe("sortByNextOccurrence", () => {
  it("orders offerings by the soonest upcoming session, not weekday roster order", () => {
    const now = new Date("2026-06-17T14:00:00"); // Wednesday afternoon
    const offerings = [
      weeklyOffering("MON", 8 * 60, "mon"),
      weeklyOffering("TUE", 16 * 60, "tue"),
      weeklyOffering("THU", 12 * 60, "thu"),
    ];

    const sorted = sortByNextOccurrence(offerings, now);

    expect(sorted.map((o) => o.id)).toEqual(["thu", "mon", "tue"]);
    expect(nextOfferingOccurrenceAt(sorted[0]!, now).getDate()).toBe(18);
    expect(nextOfferingOccurrenceAt(sorted[1]!, now).getDate()).toBe(22);
    expect(nextOfferingOccurrenceAt(sorted[2]!, now).getDate()).toBe(23);
  });
});
