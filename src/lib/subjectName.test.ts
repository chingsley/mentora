import { normalizeSubjectName, subjectSlugFromName } from "./subjectName";

describe("subjectName", () => {
  it("normalizes whitespace", () => {
    expect(normalizeSubjectName("  Swimming   Lessons  ")).toBe("Swimming Lessons");
  });

  it("builds slugs from display names", () => {
    expect(subjectSlugFromName("Swimming Lessons")).toBe("swimming-lessons");
  });
});
