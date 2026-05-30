import { offeringCapacity } from "./offeringCapacity";

describe("offeringCapacity", () => {
  it("uses min(global, teacher) for OPEN periods", () => {
    expect(
      offeringCapacity({
        periodType: "OPEN",
        globalClassCap: 30,
        teacherCap: 10,
        inviteCount: 0,
        currentEnrolled: 3,
      }),
    ).toEqual({
      effectiveCap: 10,
      remaining: 7,
      isFull: false,
    });
  });

  it("uses invite count as cap for RESERVED periods", () => {
    expect(
      offeringCapacity({
        periodType: "RESERVED",
        globalClassCap: 30,
        teacherCap: null,
        inviteCount: 4,
        currentEnrolled: 2,
      }),
    ).toEqual({
      effectiveCap: 4,
      remaining: 2,
      isFull: false,
    });
  });

  it("marks RESERVED full when all invites have enrolled", () => {
    expect(
      offeringCapacity({
        periodType: "RESERVED",
        globalClassCap: 30,
        teacherCap: null,
        inviteCount: 2,
        currentEnrolled: 2,
      }).isFull,
    ).toBe(true);
  });
});
