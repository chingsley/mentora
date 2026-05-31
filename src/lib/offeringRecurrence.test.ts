import {
  formatRecurrenceLabel,
  nextOfferingOccurrence,
  offeringOccursOnDate,
  parseIsoDate,
  patternToRecurrence,
  recurrenceFromInput,
} from "./offeringRecurrence";

describe("offeringRecurrence", () => {
  const weekly = recurrenceFromInput({ kind: "WEEKLY", anchorDate: "", ordinal: "" });

  it("matches every Monday for weekly recurrence", () => {
    expect(
      offeringOccursOnDate(weekly, "MON", parseIsoDate("2026-06-01")),
    ).toBe(true);
    expect(
      offeringOccursOnDate(weekly, "MON", parseIsoDate("2026-06-08")),
    ).toBe(true);
    expect(
      offeringOccursOnDate(weekly, "MON", parseIsoDate("2026-06-02")),
    ).toBe(false);
  });

  it("matches every other Monday from an anchor", () => {
    const biweekly = recurrenceFromInput({
      kind: "BIWEEKLY",
      anchorDate: "2026-06-01",
      ordinal: "",
    });
    expect(
      offeringOccursOnDate(biweekly, "MON", parseIsoDate("2026-06-01")),
    ).toBe(true);
    expect(
      offeringOccursOnDate(biweekly, "MON", parseIsoDate("2026-06-08")),
    ).toBe(false);
    expect(
      offeringOccursOnDate(biweekly, "MON", parseIsoDate("2026-06-15")),
    ).toBe(true);
  });

  it("matches the 2nd Monday of the month", () => {
    const secondMonday = recurrenceFromInput({
      kind: "MONTHLY_NTH",
      anchorDate: "",
      ordinal: 2,
    });
    expect(
      offeringOccursOnDate(secondMonday, "MON", parseIsoDate("2026-06-08")),
    ).toBe(true);
    expect(
      offeringOccursOnDate(secondMonday, "MON", parseIsoDate("2026-06-01")),
    ).toBe(false);
    expect(
      offeringOccursOnDate(secondMonday, "MON", parseIsoDate("2026-07-13")),
    ).toBe(true);
  });

  it("matches first and last Monday of the month", () => {
    const firstAndLast = recurrenceFromInput({
      kind: "MONTHLY_FIRST_AND_LAST",
      anchorDate: "",
      ordinal: "",
    });
    expect(
      offeringOccursOnDate(firstAndLast, "MON", parseIsoDate("2026-06-01")),
    ).toBe(true);
    expect(
      offeringOccursOnDate(firstAndLast, "MON", parseIsoDate("2026-06-29")),
    ).toBe(true);
    expect(
      offeringOccursOnDate(firstAndLast, "MON", parseIsoDate("2026-06-08")),
    ).toBe(false);
  });

  it("matches a one-time event only on its date", () => {
    const once = recurrenceFromInput({
      kind: "ONCE",
      anchorDate: "2026-06-15",
      ordinal: "",
    });
    expect(
      offeringOccursOnDate(once, "MON", parseIsoDate("2026-06-15")),
    ).toBe(true);
    expect(
      offeringOccursOnDate(once, "MON", parseIsoDate("2026-06-22")),
    ).toBe(false);
  });

  it("finds the next bi-weekly occurrence", () => {
    const biweekly = recurrenceFromInput({
      kind: "BIWEEKLY",
      anchorDate: "2026-06-01",
      ordinal: "",
    });
    const next = nextOfferingOccurrence(
      biweekly,
      "MON",
      10 * 60,
      parseIsoDate("2026-06-09"),
    );
    expect(next?.getFullYear()).toBe(2026);
    expect(next?.getMonth()).toBe(5);
    expect(next?.getDate()).toBe(15);
    expect(next?.getHours()).toBe(10);
  });

  it("labels monthly patterns with the weekday", () => {
    expect(
      formatRecurrenceLabel(
        recurrenceFromInput({ kind: "MONTHLY_NTH", anchorDate: "", ordinal: 2 }),
        "MON",
      ),
    ).toBe("2nd Monday of the month");
  });

  it("defaults bi-weekly anchor from the selected weekday", () => {
    const input = patternToRecurrence("BIWEEKLY", { kind: "WEEKLY", anchorDate: "", ordinal: "" }, "MON");
    expect(input.kind).toBe("BIWEEKLY");
    expect(input.anchorDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
