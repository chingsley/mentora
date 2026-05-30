import {
  everyTeacherSubjectHasRate,
  isTeacherCoursesPhaseComplete,
} from "./teacherCoursesCompleteness";

describe("teacherCoursesCompleteness", () => {
  describe("everyTeacherSubjectHasRate", () => {
    it("returns false when there are no subjects", () => {
      expect(
        everyTeacherSubjectHasRate({
          subjectIds: [],
          rates: [{ subjectId: "math", regionCode: "NG" }],
          teacherRegionCode: "NG",
        }),
      ).toBe(false);
    });

    it("returns true when every subject has a rate in the teacher region", () => {
      expect(
        everyTeacherSubjectHasRate({
          subjectIds: ["math", "physics"],
          rates: [
            { subjectId: "math", regionCode: "NG" },
            { subjectId: "physics", regionCode: "NG" },
          ],
          teacherRegionCode: "NG",
        }),
      ).toBe(true);
    });

    it("returns false when a subject is missing a rate in the teacher region", () => {
      expect(
        everyTeacherSubjectHasRate({
          subjectIds: ["math", "physics"],
          rates: [{ subjectId: "math", regionCode: "NG" }],
          teacherRegionCode: "NG",
        }),
      ).toBe(false);
    });

    it("accepts any region rate when the teacher region is unset", () => {
      expect(
        everyTeacherSubjectHasRate({
          subjectIds: ["math"],
          rates: [{ subjectId: "math", regionCode: "US" }],
          teacherRegionCode: null,
        }),
      ).toBe(true);
    });
  });

  describe("isTeacherCoursesPhaseComplete", () => {
    it("matches everyTeacherSubjectHasRate", () => {
      const input = {
        subjectIds: ["math"],
        rates: [{ subjectId: "math", regionCode: "NG" }],
        teacherRegionCode: "NG" as const,
      };

      expect(isTeacherCoursesPhaseComplete(input)).toBe(
        everyTeacherSubjectHasRate(input),
      );
    });
  });
});
