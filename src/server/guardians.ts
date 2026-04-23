import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  formatInviteCode,
  generateUniqueInviteCode,
  isValidInviteCodeShape,
  normalizeInviteCode,
} from "@/lib/inviteCode";
import { sendGuardianInviteEmail } from "@/lib/mailer";

export const inviteGuardianSchema = z.object({
  guardianEmail: z.string().email(),
});

export type InviteGuardianInput = z.infer<typeof inviteGuardianSchema>;

export interface GuardianInvitePayload {
  inviteCode: string;
  formattedCode: string;
}

/**
 * Creates or refreshes a guardian invite for a student. Each PENDING link owns
 * a unique 9-character invite code that the guardian enters at signup. Codes
 * are (re)generated whenever the invite transitions back to PENDING, so any
 * previously sent code is invalidated.
 */
export async function inviteGuardian(
  studentUserId: string,
  input: InviteGuardianInput,
): Promise<GuardianInvitePayload> {
  const student = await db.studentProfile.findUnique({
    where: { userId: studentUserId },
    include: { user: { select: { name: true } } },
  });
  if (!student) throw new Error("Student profile not found");

  const guardianEmail = input.guardianEmail.trim().toLowerCase();

  const inviteCode = await generateUniqueInviteCode(async (code) => {
    const existing = await db.guardianLink.findUnique({ where: { inviteCode: code } });
    return Boolean(existing);
  });

  await db.guardianLink.upsert({
    where: {
      studentProfileId_guardianEmail: {
        studentProfileId: student.id,
        guardianEmail,
      },
    },
    create: {
      studentProfileId: student.id,
      guardianEmail,
      status: "PENDING",
      inviteCode,
      invitedAt: new Date(),
    },
    update: {
      status: "PENDING",
      inviteCode,
      invitedAt: new Date(),
    },
  });

  await sendGuardianInviteEmail({
    to: guardianEmail,
    studentName: student.user.name,
    inviteCode,
  });

  return { inviteCode, formattedCode: formatInviteCode(inviteCode) };
}

export const acceptInviteCodeSchema = z.object({
  email: z.string().email(),
  inviteCode: z
    .string()
    .min(1)
    .refine((v) => isValidInviteCodeShape(v), "Invalid invite code"),
});

/**
 * Claim a PENDING `GuardianLink` using the invite code and mark it ACCEPTED
 * for the given guardian user.
 */
export async function claimGuardianInvite(args: {
  guardianUserId: string;
  email: string;
  inviteCode: string;
}) {
  const guardian = await db.guardianProfile.findUnique({
    where: { userId: args.guardianUserId },
  });
  if (!guardian) throw new Error("Guardian profile not found");

  const email = args.email.trim().toLowerCase();
  const code = normalizeInviteCode(args.inviteCode);

  const link = await db.guardianLink.findUnique({ where: { inviteCode: code } });
  if (!link || link.status !== "PENDING") {
    throw new Error("Invite code is not valid");
  }
  if (link.guardianEmail.toLowerCase() !== email) {
    throw new Error("Invite code does not match this email");
  }

  await db.guardianLink.update({
    where: { id: link.id },
    data: {
      guardianProfileId: guardian.id,
      status: "ACCEPTED",
      acceptedAt: new Date(),
      inviteCode: null,
    },
  });

  // Also accept any OTHER PENDING links that were sent to this guardian
  // email, to save them from entering multiple codes.
  await db.guardianLink.updateMany({
    where: { guardianEmail: email, status: "PENDING" },
    data: {
      guardianProfileId: guardian.id,
      status: "ACCEPTED",
      acceptedAt: new Date(),
      inviteCode: null,
    },
  });
}

export async function listStudentGuardians(studentUserId: string) {
  const student = await db.studentProfile.findUnique({ where: { userId: studentUserId } });
  if (!student) return [];
  return db.guardianLink.findMany({
    where: { studentProfileId: student.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function listLinkedStudents(guardianUserId: string) {
  const guardian = await db.guardianProfile.findUnique({
    where: { userId: guardianUserId },
  });
  if (!guardian) return [];
  return db.guardianLink.findMany({
    where: { guardianProfileId: guardian.id, status: "ACCEPTED" },
    orderBy: { acceptedAt: "desc" },
    include: {
      studentProfile: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              offering: {
                include: {
                  subject: true,
                  teacherProfile: { include: { user: { select: { name: true } } } },
                },
              },
            },
          },
        },
      },
    },
  });
}

/** Light-weight ward list for the sidebar selector. */
export async function listGuardianWards(guardianUserId: string) {
  const guardian = await db.guardianProfile.findUnique({
    where: { userId: guardianUserId },
    select: { id: true },
  });
  if (!guardian) return [];
  const links = await db.guardianLink.findMany({
    where: { guardianProfileId: guardian.id, status: "ACCEPTED" },
    orderBy: { acceptedAt: "desc" },
    include: {
      studentProfile: {
        select: {
          id: true,
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });
  return links.map((link) => ({
    studentProfileId: link.studentProfile.id,
    name: link.studentProfile.user.name,
    image: link.studentProfile.user.image,
    userId: link.studentProfile.user.id,
  }));
}

/**
 * Returns the ward's studentProfileId if the guardian is linked to that
 * student (ACCEPTED), otherwise null. Callers should redirect / throw based
 * on null.
 */
export async function findGuardianStudent(
  guardianUserId: string,
  studentProfileId: string,
): Promise<{ id: string } | null> {
  const link = await db.guardianLink.findFirst({
    where: {
      status: "ACCEPTED",
      studentProfileId,
      guardianProfile: { userId: guardianUserId },
    },
    select: { id: true },
  });
  return link;
}

/** Throws a 403-like error if the guardian is not linked to the student. */
export async function assertGuardianHasStudent(
  guardianUserId: string,
  studentProfileId: string,
): Promise<void> {
  const link = await findGuardianStudent(guardianUserId, studentProfileId);
  if (!link) {
    throw new Error("Forbidden: guardian is not linked to this student");
  }
}
