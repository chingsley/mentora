import type { DayOfWeek } from "@prisma/client";
import {
  activeScheduleDayPreset,
  applyScheduleDayPreset,
  buildOfferingDialogInitial,
  findOfferingScheduleSiblings,
  scheduleGroupDays,
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

  it("applies weekday preset using the first slot as a time template", () => {
    const current = [{ dayOfWeek: "TUE" as DayOfWeek, startTime: "14:30", endTime: "15:30" }];
    expect(applyScheduleDayPreset(current, "WEEKDAYS")).toEqual([
      { dayOfWeek: "MON", startTime: "14:30", endTime: "15:30" },
      { dayOfWeek: "TUE", startTime: "14:30", endTime: "15:30" },
      { dayOfWeek: "WED", startTime: "14:30", endTime: "15:30" },
      { dayOfWeek: "THU", startTime: "14:30", endTime: "15:30" },
      { dayOfWeek: "FRI", startTime: "14:30", endTime: "15:30" },
    ]);
  });

  it("collapses to a single day for once-a-week preset", () => {
    const current = [
      { dayOfWeek: "MON" as DayOfWeek, startTime: "09:00", endTime: "10:00" },
      { dayOfWeek: "WED" as DayOfWeek, startTime: "09:00", endTime: "10:00" },
    ];
    expect(applyScheduleDayPreset(current, "ONCE_WEEKLY")).toEqual([
      { dayOfWeek: "MON", startTime: "09:00", endTime: "10:00" },
    ]);
  });

  it("detects the active schedule preset", () => {
    const weekdays = applyScheduleDayPreset(
      [{ dayOfWeek: "MON", startTime: "09:00", endTime: "10:00" }],
      "WEEKDAYS",
    );
    expect(activeScheduleDayPreset(weekdays)).toBe("WEEKDAYS");
    expect(
      activeScheduleDayPreset([
        { dayOfWeek: "MON", startTime: "09:00", endTime: "10:00" },
        { dayOfWeek: "WED", startTime: "12:00", endTime: "13:00" },
      ]),
    ).toBeNull();
  });
});
