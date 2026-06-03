import {
  formatSessionJoinSummary,
  summarizeSessionJoins,
} from "./sessionAttendanceSummary";

describe("summarizeSessionJoins", () => {
  it("counts enrolled students and those with joinedAt from the db", () => {
    expect(
      summarizeSessionJoins([
        { joinedAt: new Date("2026-06-03T10:00:00Z") },
        { joinedAt: null },
      ]),
    ).toEqual({ enrolled: 2, joined: 1 });
  });

  it("does not count teacher-marked attendance without a join", () => {
    expect(
      summarizeSessionJoins([{ joinedAt: null }]),
    ).toEqual({ enrolled: 1, joined: 0 });
  });
});

describe("formatSessionJoinSummary", () => {
  it("formats enrolled and joined counts", () => {
    expect(
      formatSessionJoinSummary({ enrolled: 4, joined: 2 }),
    ).toBe("4 enrolled · 2 joined");
  });
});
