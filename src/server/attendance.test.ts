jest.mock("server-only", () => ({}));

const attendanceUpsert = jest.fn();
const enrollmentFindUnique = jest.fn();

jest.mock("@/lib/db", () => ({
  db: {
    attendance: { upsert: attendanceUpsert },
    enrollment: { findUnique: enrollmentFindUnique },
  },
}));

import {
  markAttendance,
  recordAutoJoin,
  resolveCurrentSessionDate,
} from "./attendance";

beforeEach(() => {
  jest.clearAllMocks();
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
  it("uses PRESENT when joining on time", async () => {
    attendanceUpsert.mockResolvedValueOnce({ id: "a1" });
    const sessionDate = new Date("2026-05-01T10:00:00Z");
    const joinedAt = new Date("2026-05-01T10:02:00Z");
    await recordAutoJoin({ enrollmentId: "e1", sessionDate, joinedAt });
    const args = attendanceUpsert.mock.calls[0][0];
    expect(args.create.status).toBe("PRESENT");
    expect(args.create.source).toBe("AUTO_JOIN");
  });

  it("uses LATE when joining past the grace window", async () => {
    attendanceUpsert.mockResolvedValueOnce({ id: "a1" });
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
      }),
    ).rejects.toThrow(/Forbidden/);
  });

  it("upserts when the teacher owns the offering", async () => {
    enrollmentFindUnique.mockResolvedValueOnce({
      offering: { teacherProfile: { userId: "my-user" } },
    });
    attendanceUpsert.mockResolvedValueOnce({ id: "a1" });
    await markAttendance("my-user", {
      enrollmentId: "cjxx000000000000000000000",
      sessionDate: new Date("2026-05-01T10:00:00Z").toISOString(),
      status: "EXCUSED",
    });
    expect(attendanceUpsert).toHaveBeenCalled();
    const args = attendanceUpsert.mock.calls[0][0];
    expect(args.create.source).toBe("TEACHER");
    expect(args.create.status).toBe("EXCUSED");
  });
});
