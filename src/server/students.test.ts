jest.mock("server-only", () => ({}));

interface InterestRecord {
  subjectId: string;
}

const studentFindUnique = jest.fn();
const studentUpdate = jest.fn();
const interestFindMany = jest.fn();
const interestDeleteMany = jest.fn();
const interestCreate = jest.fn();

const txHandle = {
  studentInterest: {
    findMany: interestFindMany,
    deleteMany: interestDeleteMany,
    create: interestCreate,
  },
};

const transaction = jest.fn(async (cb: (tx: typeof txHandle) => Promise<unknown>) => cb(txHandle));

jest.mock("@/lib/db", () => ({
  db: {
    studentProfile: {
      findUnique: studentFindUnique,
      update: studentUpdate,
    },
    $transaction: transaction,
  },
}));

import { setStudentInterests, updateStudentBio } from "./students";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("setStudentInterests", () => {
  it("upserts and removes interests based on the diff", async () => {
    studentFindUnique.mockResolvedValueOnce({ id: "student-1" });
    interestFindMany.mockResolvedValueOnce([
      { subjectId: "keep" } satisfies InterestRecord,
      { subjectId: "remove-me" } satisfies InterestRecord,
    ]);

    await setStudentInterests("user-1", { subjectIds: ["keep", "add-me"] });

    expect(interestDeleteMany).toHaveBeenCalledWith({
      where: { studentProfileId: "student-1", subjectId: { in: ["remove-me"] } },
    });
    expect(interestCreate).toHaveBeenCalledTimes(1);
    expect(interestCreate).toHaveBeenCalledWith({
      data: { studentProfileId: "student-1", subjectId: "add-me" },
    });
  });

  it("throws when no student profile exists for the user", async () => {
    studentFindUnique.mockResolvedValueOnce(null);
    await expect(
      setStudentInterests("user-404", { subjectIds: ["a"] }),
    ).rejects.toThrow(/student profile/i);
  });
});

describe("updateStudentBio", () => {
  it("persists a trimmed bio", async () => {
    studentFindUnique.mockResolvedValueOnce({ id: "student-1" });
    await updateStudentBio("user-1", { bio: "Hi there" });
    expect(studentUpdate).toHaveBeenCalledWith({
      where: { id: "student-1" },
      data: { bio: "Hi there" },
    });
  });

  it("clears the bio when an empty string is submitted", async () => {
    studentFindUnique.mockResolvedValueOnce({ id: "student-1" });
    await updateStudentBio("user-1", { bio: "" });
    expect(studentUpdate).toHaveBeenCalledWith({
      where: { id: "student-1" },
      data: { bio: null },
    });
  });
});
