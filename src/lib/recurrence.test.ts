import { nextOccurrence, stageForOccurrence } from "./recurrence";

describe("nextOccurrence", () => {
  it("returns later today when the target weekday matches and the time is ahead", () => {
    const now = new Date("2026-04-22T08:00:00"); // Wednesday
    const next = nextOccurrence("WED", 10 * 60, now);
    expect(next.getDay()).toBe(3);
    expect(next.getDate()).toBe(now.getDate());
    expect(next.getHours()).toBe(10);
  });

  it("rolls forward a full week when the time today has already passed", () => {
    const now = new Date("2026-04-22T11:00:00"); // Wednesday, 11:00
    const next = nextOccurrence("WED", 10 * 60, now);
    expect(next.getDay()).toBe(3);
    expect(next.getDate()).toBe(now.getDate() + 7);
  });

  it("jumps across the week boundary when target is earlier in the week", () => {
    const now = new Date("2026-04-24T08:00:00"); // Friday
    const next = nextOccurrence("MON", 9 * 60, now);
    expect(next.getDay()).toBe(1);
    expect(next.getTime()).toBeGreaterThan(now.getTime());
    expect(next.getDate()).toBe(27);
  });
});

describe("stageForOccurrence", () => {
  const occurrence = new Date("2026-04-22T10:00:00");

  it("returns T-10 when within the 10-minute window", () => {
    expect(stageForOccurrence(occurrence, new Date("2026-04-22T09:50:00"))).toBe("T-10");
    expect(stageForOccurrence(occurrence, new Date("2026-04-22T09:50:30"))).toBe("T-10");
  });

  it("returns T-0 within 30 seconds of the start", () => {
    expect(stageForOccurrence(occurrence, new Date("2026-04-22T10:00:00"))).toBe("T-0");
    expect(stageForOccurrence(occurrence, new Date("2026-04-22T10:00:20"))).toBe("T-0");
    expect(stageForOccurrence(occurrence, new Date("2026-04-22T09:59:35"))).toBe("T-0");
  });

  it("returns null outside both windows", () => {
    expect(stageForOccurrence(occurrence, new Date("2026-04-22T09:30:00"))).toBeNull();
    expect(stageForOccurrence(occurrence, new Date("2026-04-22T10:05:00"))).toBeNull();
  });
});
