import { majorToSmallest, minorUnitExponent, smallestToMajor } from "./money";

describe("minorUnitExponent", () => {
  it("returns 2 for USD, EUR, NGN", () => {
    expect(minorUnitExponent("USD")).toBe(2);
    expect(minorUnitExponent("EUR")).toBe(2);
    expect(minorUnitExponent("NGN")).toBe(2);
  });

  it("returns 0 for JPY", () => {
    expect(minorUnitExponent("JPY")).toBe(0);
  });
});

describe("majorToSmallest / smallestToMajor", () => {
  it("round-trips USD", () => {
    expect(majorToSmallest(15, "USD")).toBe(1500);
    expect(smallestToMajor(1500, "USD")).toBe(15);
  });

  it("round-trips NGN", () => {
    expect(majorToSmallest(3500, "NGN")).toBe(350_000);
    expect(smallestToMajor(350_000, "NGN")).toBe(3500);
  });

  it("rounds USD halves to nearest cent", () => {
    expect(majorToSmallest(10.125, "USD")).toBe(1013);
  });
});
