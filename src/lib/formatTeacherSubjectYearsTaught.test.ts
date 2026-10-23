import { formatTeacherSubjectYearsTaught } from "./formatTeacherSubjectYearsTaught";

describe("formatTeacherSubjectYearsTaught", () => {
  it("formats singular and plural years", () => {
    expect(formatTeacherSubjectYearsTaught(1)).toBe("1 year");
    expect(formatTeacherSubjectYearsTaught(3)).toBe("3 years");
  });

  it("returns null for missing or invalid values", () => {
    expect(formatTeacherSubjectYearsTaught(0)).toBeNull();
    expect(formatTeacherSubjectYearsTaught(-1)).toBeNull();
    expect(formatTeacherSubjectYearsTaught(1.5)).toBeNull();
  });
});
