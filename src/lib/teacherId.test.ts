import { TEACHER_DISPLAY_ID_REGEX, formatTeacherDisplayId } from "./teacherIdFormat";

describe("formatTeacherDisplayId", () => {
  const date = new Date(Date.UTC(2026, 3, 22, 10, 0, 0));

  it("formats the first teacher of the day as 01A", () => {
    expect(formatTeacherDisplayId(date, 0)).toBe("T-260422-01A");
  });

  it("rolls the letter within a group of 26", () => {
    expect(formatTeacherDisplayId(date, 25)).toBe("T-260422-01Z");
  });

  it("bumps the numeric group after 26 ids", () => {
    expect(formatTeacherDisplayId(date, 26)).toBe("T-260422-02A");
    expect(formatTeacherDisplayId(date, 51)).toBe("T-260422-02Z");
    expect(formatTeacherDisplayId(date, 52)).toBe("T-260422-03A");
  });

  it("rejects negative or non-integer indices", () => {
    expect(() => formatTeacherDisplayId(date, -1)).toThrow();
    expect(() => formatTeacherDisplayId(date, 1.5)).toThrow();
  });

  it("all generated ids match the expected format", () => {
    for (let i = 0; i < 104; i += 1) {
      expect(formatTeacherDisplayId(date, i)).toMatch(TEACHER_DISPLAY_ID_REGEX);
    }
  });
});
