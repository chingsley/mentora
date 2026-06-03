jest.mock("server-only", () => ({}));

const attendanceUpsert = jest.fn();
const attendanceFindUnique = jest.fn();
const attendanceCreate = jest.fn();
const attendanceChangeLogCreate = jest.fn();
const enrollmentFindUnique = jest.fn();
const sessionOccurrenceUpsert = jest.fn();
const sessionOccurrenceFindUnique = jest.fn();
const sessionOccurrenceCreate = jest.fn();
const transactionFn = jest.fn();

jest.mock("@/lib/db", () => ({
  db: {
    attendance: {
      upsert: attendanceUpsert,
      findUnique: attendanceFindUnique,
      create: attendanceCreate,
    },
    attendanceChangeLog: { create: attendanceChangeLogCreate },
    enrollment: { findUnique: enrollmentFindUnique, findMany: jest.fn() },
    sessionOccurrence: {
      upsert: sessionOccurrenceUpsert,
      findUnique: sessionOccurrenceFindUnique,
      create: sessionOccurrenceCreate,
    },
    $transaction: transactionFn,
  },
}));

import { ATTENDANCE_SYSTEM_COMMENT } from "@/constants/attendance.constants";
import {
  markAttendance,
  recordAutoJoin,
  resolveCurrentSessionDate,
} from "./attendance";

beforeEach(() => {
  jest.clearAllMocks();
  transactionFn.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      attendance: {
        upsert: attendanceUpsert,
        findUnique: attendanceFindUnique,
        create: attendanceCreate,
      },
      attendanceChangeLog: { create: attendanceChangeLogCreate },
      sessionOccurrence: {
        upsert: sessionOccurrenceUpsert,
        findUnique: sessionOccurrenceFindUnique,
        create: sessionOccurrenceCreate,
      },
    }),
  );
});

describe("resolveCurrentSessionDate", () => {
  it("returns a date inside the join window", () => {
    const now = new Date();
    const dayEnum = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
    const today = dayEnum[now.getDay()]!;
    const startMinutes = now.getHours() * 60 + now.getMinutes();
    const result = resolveCurrentSessionDate({
      dayOfWeek: today,
      startMinutes,
      now,
    });
    expect(result).not.toBeNull();
  });

  it("returns null when the next occurrence is far away", () => {
    const now = new Date("2026-06-01T10:00:00Z");
    const result = resolveCurrentSessionDate({
      dayOfWeek: "MON",
      startMinutes: 22 * 60,
      now,
    });
    expect(result).toBeNull();
  });
});

describe("recordAutoJoin", () => {
  it("uses PRESENT when joining on time and logs system comment", async () => {
    attendanceFindUnique.mockResolvedValueOnce(null);
    attendanceUpsert.mockResolvedValueOnce({ id: "a1", status: "PRESENT" });
    const sessionDate = new Date("2026-05-01T10:00:00Z");
    const joinedAt = new Date("2026-05-01T10:02:00Z");
    await recordAutoJoin({ enrollmentId: "e1", sessionDate, joinedAt });
    const args = attendanceUpsert.mock.calls[0][0];
    expect(args.create.status).toBe("PRESENT");
    expect(args.create.source).toBe("AUTO_JOIN");
    expect(attendanceChangeLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          comment: ATTENDANCE_SYSTEM_COMMENT.STUDENT_JOINED,
          newStatus: "PRESENT",
          source: "AUTO_JOIN",
        }),
      }),
    );
  });

  it("uses LATE when joining past the grace window", async () => {
    attendanceFindUnique.mockResolvedValueOnce(null);
    attendanceUpsert.mockResolvedValueOnce({ id: "a1", status: "LATE" });
    const sessionDate = new Date("2026-05-01T10:00:00Z");
    const joinedAt = new Date("2026-05-01T10:10:00Z");
    await recordAutoJoin({ enrollmentId: "e1", sessionDate, joinedAt });
    const args = attendanceUpsert.mock.calls[0][0];
    expect(args.create.status).toBe("LATE");
  });
});

describe("markAttendance", () => {
  it("rejects teachers that don't own the offering", async () => {
    enrollmentFindUnique.mockResolvedValueOnce({
      offering: { teacherProfile: { userId: "other-user" } },
    });
    await expect(
      markAttendance("my-user", {
        enrollmentId: "cjxx000000000000000000000",
        sessionDate: new Date().toISOString(),
        status: "PRESENT",
        comment: "Student arrived on time",
      }),
    ).rejects.toThrow(/Forbidden/);
  });

  it("upserts when the teacher owns the offering and writes audit log", async () => {
    enrollmentFindUnique.mockResolvedValueOnce({
      offeringId: "off-1",
      offering: {
        teacherProfile: { userId: "my-user" },
        id: "off-1",
        startMinutes: 10 * 60,
      },
    });
    attendanceFindUnique.mockResolvedValueOnce({ status: "ABSENT" });
    attendanceUpsert.mockResolvedValueOnce({ id: "a1" });
    sessionOccurrenceUpsert.mockResolvedValueOnce({ id: "so1" });
    await markAttendance("my-user", {
      enrollmentId: "cjxx000000000000000000000",
      sessionDate: new Date("2026-05-01T10:00:00Z").toISOString(),
      status: "EXCUSED",
      comment: "Medical appointment",
    });
    expect(attendanceUpsert).toHaveBeenCalled();
    const args = attendanceUpsert.mock.calls[0][0];
    expect(args.create.source).toBe("TEACHER");
    expect(args.create.status).toBe("EXCUSED");
    expect(attendanceChangeLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          previousStatus: "ABSENT",
          newStatus: "EXCUSED",
          comment: "Medical appointment",
          changedByUserId: "my-user",
        }),
      }),
    );
  });
});
