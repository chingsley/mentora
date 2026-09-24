import { formatSubjectShortLabel } from "./subjectShortLabel";

describe("formatSubjectShortLabel", () => {
  it("maps seeded catalog subjects to short labels", () => {
    expect(formatSubjectShortLabel("English")).toBe("Eng");
    expect(formatSubjectShortLabel("Literature")).toBe("Lit");
    expect(formatSubjectShortLabel("Mathematics")).toBe("Math");
    expect(formatSubjectShortLabel("Economics")).toBe("Econ");
    expect(formatSubjectShortLabel("Programming")).toBe("Prog");
  });

  it("is case-insensitive for known subjects", () => {
    expect(formatSubjectShortLabel("  literature ")).toBe("Lit");
  });

  it("falls back for unknown subjects", () => {
    expect(formatSubjectShortLabel("Computer Science")).toBe("CS");
    expect(formatSubjectShortLabel("Art")).toBe("Art");
  });
});
