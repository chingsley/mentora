import { clampTeacherCap, computeCapacity } from "./capacity";

describe("computeCapacity", () => {
  it("uses the admin cap when it's lower than the teacher cap", () => {
    expect(computeCapacity({ globalClassCap: 20, teacherCap: 50, currentEnrolled: 10 })).toEqual({
      effectiveCap: 20,
      remaining: 10,
      isFull: false,
    });
  });

  it("uses the teacher cap when it's lower than the admin cap", () => {
    expect(computeCapacity({ globalClassCap: 30, teacherCap: 5, currentEnrolled: 3 })).toEqual({
      effectiveCap: 5,
      remaining: 2,
      isFull: false,
    });
  });

  it("reports full when enrollment reaches effective cap", () => {
    expect(computeCapacity({ globalClassCap: 30, teacherCap: 5, currentEnrolled: 5 })).toEqual({
      effectiveCap: 5,
      remaining: 0,
      isFull: true,
    });
  });

  it("never reports negative remaining if over-enrolled", () => {
    expect(computeCapacity({ globalClassCap: 10, teacherCap: 10, currentEnrolled: 99 })).toEqual({
      effectiveCap: 10,
      remaining: 0,
      isFull: true,
    });
  });

  it("rejects invalid inputs", () => {
    expect(() => computeCapacity({ globalClassCap: 0, teacherCap: 5, currentEnrolled: 0 })).toThrow();
    expect(() => computeCapacity({ globalClassCap: 5, teacherCap: -1, currentEnrolled: 0 })).toThrow();
    expect(() => computeCapacity({ globalClassCap: 5, teacherCap: 5, currentEnrolled: -1 })).toThrow();
  });
});

describe("clampTeacherCap", () => {
  it("returns the teacher cap when it's within the global cap", () => {
    expect(clampTeacherCap(15, 30)).toBe(15);
  });

  it("clamps the teacher cap down to the global cap", () => {
    expect(clampTeacherCap(50, 30)).toBe(30);
  });

  it("bumps values below 1 up to 1", () => {
    expect(clampTeacherCap(0, 30)).toBe(1);
  });
});
