jest.mock("server-only", () => ({}));

const studentFindUnique = jest.fn();
const guardianFindUnique = jest.fn();
const linkUpsert = jest.fn();
const linkFindUnique = jest.fn();
const linkFindFirst = jest.fn();
const linkFindMany = jest.fn();
const linkUpdate = jest.fn();
const linkUpdateMany = jest.fn();

jest.mock("@/lib/db", () => ({
  db: {
    studentProfile: { findUnique: studentFindUnique },
    guardianProfile: { findUnique: guardianFindUnique },
    guardianLink: {
      upsert: linkUpsert,
      findUnique: linkFindUnique,
      findFirst: linkFindFirst,
      findMany: linkFindMany,
      update: linkUpdate,
      updateMany: linkUpdateMany,
    },
  },
}));

const sendGuardianInviteEmail = jest.fn();
jest.mock("@/lib/mailer", () => ({ sendGuardianInviteEmail }));

import {
  assertGuardianHasStudent,
  claimGuardianInvite,
  findGuardianStudent,
  inviteGuardian,
} from "./guardians";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("inviteGuardian", () => {
  it("throws when the student profile doesn't exist", async () => {
    studentFindUnique.mockResolvedValueOnce(null);
    await expect(
      inviteGuardian("user-1", { guardianEmail: "g@example.com" }),
    ).rejects.toThrow(/Student profile/i);
  });

  it("creates/refreshes a pending link and emails the guardian", async () => {
    studentFindUnique.mockResolvedValueOnce({
      id: "stu-1",
      user: { name: "Alice" },
    });
    linkFindUnique.mockResolvedValue(null);
    linkUpsert.mockResolvedValueOnce({ id: "link-1" });

    const result = await inviteGuardian("user-1", {
      guardianEmail: " Guardian@Example.com ",
    });

    expect(linkUpsert).toHaveBeenCalled();
    const upsertArgs = linkUpsert.mock.calls[0][0];
    expect(upsertArgs.create.guardianEmail).toBe("guardian@example.com");
    expect(upsertArgs.create.status).toBe("PENDING");
    expect(upsertArgs.update.status).toBe("PENDING");
    expect(typeof upsertArgs.create.inviteCode).toBe("string");
    expect(upsertArgs.create.inviteCode).toHaveLength(9);

    expect(sendGuardianInviteEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "guardian@example.com",
        studentName: "Alice",
        inviteCode: upsertArgs.create.inviteCode,
      }),
    );

    expect(result.inviteCode).toHaveLength(9);
    expect(result.formattedCode).toMatch(/^[A-Z2-9]{3}-[A-Z2-9]{3}-[A-Z2-9]{3}$/);
  });
});

describe("claimGuardianInvite", () => {
  it("throws when the guardian profile is missing", async () => {
    guardianFindUnique.mockResolvedValueOnce(null);
    await expect(
      claimGuardianInvite({
        guardianUserId: "u1",
        email: "g@example.com",
        inviteCode: "ABCDEFGHJ",
      }),
    ).rejects.toThrow(/Guardian profile/i);
  });

  it("refuses when the code is not PENDING", async () => {
    guardianFindUnique.mockResolvedValueOnce({ id: "g1" });
    linkFindUnique.mockResolvedValueOnce({
      id: "l1",
      status: "ACCEPTED",
      guardianEmail: "g@example.com",
    });
    await expect(
      claimGuardianInvite({
        guardianUserId: "u1",
        email: "g@example.com",
        inviteCode: "ABCDEFGHJ",
      }),
    ).rejects.toThrow(/not valid/i);
  });

  it("refuses when email does not match the link", async () => {
    guardianFindUnique.mockResolvedValueOnce({ id: "g1" });
    linkFindUnique.mockResolvedValueOnce({
      id: "l1",
      status: "PENDING",
      guardianEmail: "other@example.com",
    });
    await expect(
      claimGuardianInvite({
        guardianUserId: "u1",
        email: "g@example.com",
        inviteCode: "ABCDEFGHJ",
      }),
    ).rejects.toThrow(/does not match/i);
  });

  it("accepts and also batches other pending links for the same email", async () => {
    guardianFindUnique.mockResolvedValueOnce({ id: "g1" });
    linkFindUnique.mockResolvedValueOnce({
      id: "l1",
      status: "PENDING",
      guardianEmail: "g@example.com",
    });
    linkUpdate.mockResolvedValueOnce({});
    linkUpdateMany.mockResolvedValueOnce({ count: 1 });

    await claimGuardianInvite({
      guardianUserId: "u1",
      email: "G@Example.com",
      inviteCode: "abc-def-ghj",
    });

    const updArgs = linkUpdate.mock.calls[0][0];
    expect(updArgs.data.status).toBe("ACCEPTED");
    expect(updArgs.data.guardianProfileId).toBe("g1");
    expect(linkUpdateMany).toHaveBeenCalled();
  });
});

describe("assertGuardianHasStudent", () => {
  it("throws when no ACCEPTED link exists", async () => {
    linkFindFirst.mockResolvedValueOnce(null);
    await expect(
      assertGuardianHasStudent("u1", "stu1"),
    ).rejects.toThrow(/Forbidden/);
  });

  it("returns silently when a link exists", async () => {
    linkFindFirst.mockResolvedValueOnce({ id: "l1" });
    await expect(
      assertGuardianHasStudent("u1", "stu1"),
    ).resolves.toBeUndefined();
  });
});

describe("findGuardianStudent", () => {
  it("returns the link when found", async () => {
    linkFindFirst.mockResolvedValueOnce({ id: "l1" });
    const res = await findGuardianStudent("u1", "stu1");
    expect(res).toEqual({ id: "l1" });
  });

  it("returns null when absent", async () => {
    linkFindFirst.mockResolvedValueOnce(null);
    const res = await findGuardianStudent("u1", "stu1");
    expect(res).toBeNull();
  });
});
