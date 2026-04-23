jest.mock("server-only", () => ({}));

const userFindUnique = jest.fn();
const teacherFindUnique = jest.fn();
const reportCreate = jest.fn();
const reportFindMany = jest.fn();
const reportUpdate = jest.fn();

jest.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: userFindUnique },
    teacherProfile: { findUnique: teacherFindUnique },
    teacherReport: {
      create: reportCreate,
      findMany: reportFindMany,
      update: reportUpdate,
    },
  },
}));

import {
  createTeacherReport,
  createTeacherReportSchema,
  listReportsForAdmin,
  updateReportStatus,
} from "./teacherReports";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createTeacherReportSchema", () => {
  it("rejects short descriptions", () => {
    const res = createTeacherReportSchema.safeParse({
      teacherProfileId: "cjxx000000000000000000000",
      reason: "HARASSMENT",
      description: "short",
    });
    expect(res.success).toBe(false);
  });

  it("accepts valid payloads", () => {
    const res = createTeacherReportSchema.safeParse({
      teacherProfileId: "cjxx000000000000000000000",
      reason: "NO_SHOW",
      description: "Teacher did not show up today for the 10am class.",
    });
    expect(res.success).toBe(true);
  });
});

describe("createTeacherReport", () => {
  it("refuses teachers", async () => {
    userFindUnique.mockResolvedValueOnce({ role: "TEACHER" });
    await expect(
      createTeacherReport({
        reporterUserId: "u1",
        input: {
          teacherProfileId: "t1",
          reason: "HARASSMENT",
          description: "Something happened that was not appropriate.",
        },
      }),
    ).rejects.toThrow(/students or guardians/i);
  });

  it("creates when reporter is a student", async () => {
    userFindUnique.mockResolvedValueOnce({ role: "STUDENT" });
    teacherFindUnique.mockResolvedValueOnce({ id: "t1" });
    reportCreate.mockResolvedValueOnce({ id: "r1" });
    await createTeacherReport({
      reporterUserId: "u1",
      input: {
        teacherProfileId: "t1",
        reason: "HARASSMENT",
        description: "Something happened that was not appropriate.",
      },
    });
    expect(reportCreate).toHaveBeenCalled();
    const args = reportCreate.mock.calls[0][0];
    expect(args.data.reporterRole).toBe("STUDENT");
  });
});

describe("admin helpers", () => {
  it("lists reports with optional status filter", async () => {
    reportFindMany.mockResolvedValueOnce([]);
    await listReportsForAdmin({ status: "OPEN" });
    expect(reportFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "OPEN" } }),
    );
  });

  it("updates report status", async () => {
    reportUpdate.mockResolvedValueOnce({});
    await updateReportStatus({ reportId: "cjxx000000000000000000000", status: "REVIEWED" });
    expect(reportUpdate).toHaveBeenCalled();
  });
});
