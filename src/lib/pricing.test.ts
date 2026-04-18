import {
  BelowMinimumRateError,
  assertAtLeastMinRate,
  computePrice,
  periodMinutes,
} from "./pricing";

describe("computePrice", () => {
  it("uses the teacher rate when above the region minimum", () => {
    const result = computePrice({
      teacherRate: { regionCode: "NG", hourlyRate: 500_000 }, // 5000 NGN
      minRate: { regionCode: "NG", hourlyRate: 350_000 },
      minutes: 120,
    });
    expect(result.hourlyRate).toBe(500_000);
    expect(result.total).toBe(1_000_000);
  });

  it("floors the rate to the region minimum when teacher undercuts", () => {
    const result = computePrice({
      teacherRate: { regionCode: "NG", hourlyRate: 200_000 },
      minRate: { regionCode: "NG", hourlyRate: 350_000 },
      minutes: 60,
    });
    expect(result.hourlyRate).toBe(350_000);
    expect(result.total).toBe(350_000);
  });

  it("handles fractional hours correctly", () => {
    const result = computePrice({
      teacherRate: { regionCode: "US", hourlyRate: 1500 }, // 15 USD
      minRate: { regionCode: "US", hourlyRate: 1000 },
      minutes: 90,
    });
    expect(result.total).toBe(2250);
  });

  it("rejects region mismatch", () => {
    expect(() =>
      computePrice({
        teacherRate: { regionCode: "NG", hourlyRate: 500_000 },
        minRate: { regionCode: "US", hourlyRate: 1000 },
        minutes: 60,
      }),
    ).toThrow();
  });

  it("returns 0 total for 0 minutes", () => {
    const result = computePrice({
      teacherRate: { regionCode: "NG", hourlyRate: 500_000 },
      minRate: null,
      minutes: 0,
    });
    expect(result.total).toBe(0);
  });
});

describe("periodMinutes", () => {
  it("returns duration in minutes", () => {
    expect(periodMinutes(8 * 60, 10 * 60)).toBe(120);
  });

  it("throws when end is not after start", () => {
    expect(() => periodMinutes(600, 600)).toThrow();
    expect(() => periodMinutes(600, 500)).toThrow();
  });
});

describe("assertAtLeastMinRate", () => {
  it("does not throw when proposed meets minimum", () => {
    expect(() => assertAtLeastMinRate(1000, 1000)).not.toThrow();
    expect(() => assertAtLeastMinRate(1500, 1000)).not.toThrow();
  });

  it("throws BelowMinimumRateError when below", () => {
    expect(() => assertAtLeastMinRate(500, 1000)).toThrow(BelowMinimumRateError);
  });
});
