import type { DayOfWeek } from "@prisma/client";
import {
  buildOfferingDialogInitial,
  findOfferingScheduleSiblings,
  scheduleEditorValueFromSlots,
  scheduleGroupDays,
  slotsAndRecurrenceFromScheduleEditor,
  sortOfferingDaySlots,
  uniqueDaysOfWeek,
} from "./offeringSchedule";

describe("offeringSchedule", () => {
  const rows = [
    {
      id: "a",
      scheduleGroupId: "group-1",
      dayOfWeek: "MON" as DayOfWeek,
      title: "Algebra",
      description: "",
      subjectId: "math",
      startMinutes: 540,
      endMinutes: 600,
      periodType: "OPEN" as const,
      teacherCap: 8,
      hourlyRate: 500_000,
      invitedStudentProfileIds: [],
      enrolled: 2,
    },
    {
      id: "b",
      scheduleGroupId: "group-1",
      dayOfWeek: "WED" as DayOfWeek,
      title: "Algebra",
      description: "",
      subjectId: "math",
      startMinutes: 720,
      endMinutes: 780,
      periodType: "OPEN" as const,
      teacherCap: 8,
      hourlyRate: 500_000,
      invitedStudentProfileIds: [],
      enrolled: 1,
    },
    {
      id: "c",
      scheduleGroupId: null,
      dayOfWeek: "FRI" as DayOfWeek,
      title: "Biology",
      description: "",
      subjectId: "bio",
      startMinutes: 600,
      endMinutes: 660,
      periodType: "OPEN" as const,
      teacherCap: 6,
      hourlyRate: 500_000,
      invitedStudentProfileIds: [],
      enrolled: 0,
    },
  ];

  it("orders unique days in calendar order", () => {
    expect(uniqueDaysOfWeek(["WED", "MON", "WED"])).toEqual(["MON", "WED"]);
  });

  it("finds siblings by schedule group id", () => {
    expect(findOfferingScheduleSiblings(rows, rows[0]!)).toHaveLength(2);
    expect(findOfferingScheduleSiblings(rows, rows[2]!)).toHaveLength(1);
  });

  it("builds dialog initial state with per-day times for a multi-day group", () => {
    const initial = buildOfferingDialogInitial(rows[0]!, rows);
    expect(initial.slots).toEqual([
      { dayOfWeek: "MON", startMinutes: 540, endMinutes: 600 },
      { dayOfWeek: "WED", startMinutes: 720, endMinutes: 780 },
    ]);
    expect(initial.groupEnrolled).toBe(3);
    expect(initial.groupDayCount).toBe(2);
  });

  it("builds dialog initial state for a single-day offering", () => {
    const initial = buildOfferingDialogInitial(rows[2]!, rows);
    expect(scheduleGroupDays([rows[2]!])).toEqual(["FRI"]);
    expect(initial.slots).toEqual([
      { dayOfWeek: "FRI", startMinutes: 600, endMinutes: 660 },
    ]);
  });

  it("sorts slots in calendar day order", () => {
    expect(
      sortOfferingDaySlots([
        { dayOfWeek: "FRI", startMinutes: 900, endMinutes: 960 },
        { dayOfWeek: "MON", startMinutes: 540, endMinutes: 600 },
      ]),
    ).toEqual([
      { dayOfWeek: "MON", startMinutes: 540, endMinutes: 600 },
      { dayOfWeek: "FRI", startMinutes: 900, endMinutes: 960 },
    ]);
  });

  it("converts schedule editor value to weekly slots and recurrence", () => {
    const result = slotsAndRecurrenceFromScheduleEditor({
      startDate: "2026-06-02",
      startTime: "13:30",
      endTime: "14:00",
      isRecurring: true,
      repeatInterval: 1,
      repeatUnit: "week",
      selectedDays: ["TUE", "THU"],
      monthlyPosition: "NTH_1",
      untilDate: "",
    });

    expect(result.slots).toEqual([
      { dayOfWeek: "TUE", startTime: "13:30", endTime: "14:00" },
      { dayOfWeek: "THU", startTime: "13:30", endTime: "14:00" },
    ]);
    expect(result.recurrence.kind).toBe("WEEKLY");
    expect(result.recurrence.anchorDate).toBe("2026-06-02");
  });

  it("round-trips bi-weekly schedule editor state", () => {
    const slots = [
      { dayOfWeek: "TUE" as DayOfWeek, startTime: "13:30", endTime: "14:00" },
    ];
    const recurrence = {
      kind: "BIWEEKLY" as const,
      anchorDate: "2026-06-02",
      ordinal: "" as const,
      interval: 3 as const,
    };
    const editor = scheduleEditorValueFromSlots(slots, recurrence);
    expect(editor.repeatInterval).toBe(3);
    expect(slotsAndRecurrenceFromScheduleEditor(editor).recurrence).toEqual(recurrence);
  });

  it("maps one-time schedule editor value to a single slot", () => {
    const result = slotsAndRecurrenceFromScheduleEditor({
      startDate: "2026-06-15",
      startTime: "09:00",
      endTime: "10:00",
      isRecurring: false,
      repeatInterval: 1,
      repeatUnit: "week",
      selectedDays: ["MON"],
      monthlyPosition: "NTH_1",
      untilDate: "",
    });

    expect(result.recurrence.kind).toBe("ONCE");
    expect(result.slots).toHaveLength(1);
    expect(result.slots[0]?.dayOfWeek).toBe("MON");
  });
});
