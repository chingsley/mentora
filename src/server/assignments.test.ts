jest.mock("server-only", () => ({}));

jest.mock("@/lib/db", () => ({ db: {} }));

jest.mock("@/lib/providers/storage", () => ({
  storageProvider: {
    upload: jest.fn(),
    readStream: jest.fn(),
    getSignedUrl: jest.fn(),
    remove: jest.fn(),
  },
}));

import {
  createAssignmentSchema,
  gradeSubmissionSchema,
  submitAssignmentSchema,
} from "./assignments";

describe("createAssignmentSchema", () => {
  it("requires a title of at least 3 chars", () => {
    const res = createAssignmentSchema.safeParse({
      offeringId: "cjxx000000000000000000000",
      title: "hi",
      dueAt: new Date().toISOString(),
    });
    expect(res.success).toBe(false);
  });

  it("coerces dueAt into a Date", () => {
    const res = createAssignmentSchema.safeParse({
      offeringId: "cjxx000000000000000000000",
      title: "Essay #1",
      description: "",
      dueAt: "2026-09-01T12:00:00Z",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.dueAt).toBeInstanceOf(Date);
    }
  });
});

describe("submitAssignmentSchema", () => {
  it("requires a cuid", () => {
    expect(
      submitAssignmentSchema.safeParse({ assignmentId: "not-a-cuid" }).success,
    ).toBe(false);
    expect(
      submitAssignmentSchema.safeParse({
        assignmentId: "cjxx000000000000000000000",
      }).success,
    ).toBe(true);
  });
});

describe("gradeSubmissionSchema", () => {
  it("clamps to [0, 100]", () => {
    expect(
      gradeSubmissionSchema.safeParse({
        submissionId: "cjxx000000000000000000000",
        grade: -1,
        feedback: "",
      }).success,
    ).toBe(false);
    expect(
      gradeSubmissionSchema.safeParse({
        submissionId: "cjxx000000000000000000000",
        grade: 101,
        feedback: "",
      }).success,
    ).toBe(false);
    expect(
      gradeSubmissionSchema.safeParse({
        submissionId: "cjxx000000000000000000000",
        grade: 88,
        feedback: "Nice work",
      }).success,
    ).toBe(true);
  });

  it("defaults feedback to empty string when missing", () => {
    const res = gradeSubmissionSchema.safeParse({
      submissionId: "cjxx000000000000000000000",
      grade: 90,
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.feedback).toBe("");
  });
});
