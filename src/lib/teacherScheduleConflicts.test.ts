import { defaultOfferingScheduleEditorValue } from "@/lib/offeringSchedule";
import { findSetupScheduleConflicts } from "./teacherScheduleConflicts";

describe("findSetupScheduleConflicts", () => {
  it("flags overlapping slots across subjects", () => {
    const math = defaultOfferingScheduleEditorValue("MON", 9 * 60, 10 * 60);
    const english = defaultOfferingScheduleEditorValue("MON", 9 * 60 + 30, 10 * 60 + 30);

    const errors = findSetupScheduleConflicts({
      subjects: [
        { id: "math", name: "Math" },
        { id: "english", name: "English" },
      ],
      drafts: {
        math: { schedule: math },
        english: { schedule: english },
      },
    });

    expect(errors.math).toContain("English");
    expect(errors.english).toContain("Math");
  });

  it("ignores adjacent non-overlapping slots", () => {
    const math = defaultOfferingScheduleEditorValue("MON", 9 * 60, 10 * 60);
    const english = defaultOfferingScheduleEditorValue("MON", 10 * 60, 11 * 60);

    const errors = findSetupScheduleConflicts({
      subjects: [
        { id: "math", name: "Math" },
        { id: "english", name: "English" },
      ],
      drafts: {
        math: { schedule: math },
        english: { schedule: english },
      },
    });

    expect(errors).toEqual({});
  });
});
