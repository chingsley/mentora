import "server-only";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const inviteGuardianSchema = z.object({
  guardianEmail: z.string().email(),
});

export type InviteGuardianInput = z.infer<typeof inviteGuardianSchema>;

export interface GuardianInvitePayload {
  token: string;
  link: string;
}

/**
 * Creates (or refreshes) a guardian invite for a student. In MVP we do not
 * send real email; the caller should surface the link back to the student or
 * log it via the server console for the guardian to click manually.
 */
export async function inviteGuardian(
  studentUserId: string,
  input: InviteGuardianInput,
): Promise<GuardianInvitePayload> {
  const student = await db.studentProfile.findUnique({ where: { userId: studentUserId } });
  if (!student) throw new Error("Student profile not found");

  await db.guardianLink.upsert({
    where: {
      studentProfileId_guardianEmail: {
        studentProfileId: student.id,
        guardianEmail: input.guardianEmail,
      },
    },
    create: {
      studentProfileId: student.id,
      guardianEmail: input.guardianEmail,
      status: "PENDING",
    },
    update: { status: "PENDING" },
  });

  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await db.verificationToken.create({
    data: {
      identifier: input.guardianEmail,
      token,
      expires,
      purpose: "guardian-invite",
    },
  });

  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${base}/guardians/accept?token=${token}&email=${encodeURIComponent(input.guardianEmail)}`;

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[mentora] guardian invite for ${input.guardianEmail}: ${link}`);
  }

  return { token, link };
}

export async function acceptGuardianInvite(args: {
  token: string;
  email: string;
  guardianUserId: string;
}) {
  const vt = await db.verificationToken.findUnique({ where: { token: args.token } });
  if (!vt || vt.purpose !== "guardian-invite" || vt.identifier !== args.email) {
    throw new Error("Invalid or expired invite");
  }
  if (vt.expires < new Date()) throw new Error("Invite expired");

  const guardian = await db.guardianProfile.findUnique({
    where: { userId: args.guardianUserId },
  });
  if (!guardian) throw new Error("Guardian profile not found");

  const link = await db.guardianLink.findFirst({
    where: { guardianEmail: args.email, status: "PENDING" },
  });
  if (!link) throw new Error("No pending invite for this email");

  await db.guardianLink.update({
    where: { id: link.id },
    data: {
      guardianProfileId: guardian.id,
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
  });

  await db.verificationToken.delete({ where: { token: args.token } });
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
    include: {
      studentProfile: {
        include: {
          user: { select: { id: true, name: true, email: true } },
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
