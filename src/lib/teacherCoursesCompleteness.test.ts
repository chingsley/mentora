import { isTeacherCoursesPhaseComplete } from "./teacherCoursesCompleteness";

describe("teacherCoursesCompleteness", () => {
  describe("isTeacherCoursesPhaseComplete", () => {
    it("returns false when there are no subjects", () => {
      expect(isTeacherCoursesPhaseComplete({ subjectIds: [] })).toBe(false);
    });

    it("returns true when at least one subject is declared", () => {
      expect(isTeacherCoursesPhaseComplete({ subjectIds: ["math"] })).toBe(true);
      expect(isTeacherCoursesPhaseComplete({ subjectIds: ["math", "physics"] })).toBe(true);
    });
  });
});
