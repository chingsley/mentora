import { intervalsOverlapHalfOpen } from "./scheduleOverlap";

describe("intervalsOverlapHalfOpen", () => {
  it("returns false for adjacent half-open intervals", () => {
    expect(intervalsOverlapHalfOpen(600, 720, 720, 780)).toBe(false);
  });

  it("returns true when one interval is inside another", () => {
    expect(intervalsOverlapHalfOpen(600, 780, 660, 720)).toBe(true);
  });

  it("returns true for partial overlap", () => {
    expect(intervalsOverlapHalfOpen(600, 720, 660, 780)).toBe(true);
  });

  it("returns false for separated intervals", () => {
    expect(intervalsOverlapHalfOpen(600, 660, 720, 780)).toBe(false);
  });
});
