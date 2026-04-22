import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";

export const setStudentInterestsSchema = z.object({
  subjectIds: z.array(z.string().min(1)).max(20),
});

export type SetStudentInterestsInput = z.infer<typeof setStudentInterestsSchema>;

export const updateStudentBioSchema = z.object({
  bio: z.string().trim().max(2000),
});

export type UpdateStudentBioInput = z.infer<typeof updateStudentBioSchema>;

export async function getMyStudentProfile(studentUserId: string) {
  const profile = await db.studentProfile.findUnique({
    where: { userId: studentUserId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          region: true,
        },
      },
      interests: { include: { subject: true } },
      enrollments: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
    },
  });
  return profile;
}

async function requireStudent(studentUserId: string) {
  const profile = await db.studentProfile.findUnique({
    where: { userId: studentUserId },
  });
  if (!profile) throw new Error("Student profile not found");
  return profile;
}

export async function setStudentInterests(
  studentUserId: string,
  input: SetStudentInterestsInput,
) {
  const student = await requireStudent(studentUserId);
  const nextIds = new Set(input.subjectIds);

  await db.$transaction(async (tx) => {
    const existing = await tx.studentInterest.findMany({
      where: { studentProfileId: student.id },
      select: { subjectId: true },
    });
    const existingIds = new Set(existing.map((e) => e.subjectId));

    const toDelete = [...existingIds].filter((id) => !nextIds.has(id));
    if (toDelete.length > 0) {
      await tx.studentInterest.deleteMany({
        where: { studentProfileId: student.id, subjectId: { in: toDelete } },
      });
    }

    const toCreate = [...nextIds].filter((id) => !existingIds.has(id));
    for (const subjectId of toCreate) {
      await tx.studentInterest.create({
        data: { studentProfileId: student.id, subjectId },
      });
    }
  });
}

export async function updateStudentBio(
  studentUserId: string,
  input: UpdateStudentBioInput,
) {
  const student = await requireStudent(studentUserId);
  await db.studentProfile.update({
    where: { id: student.id },
    data: { bio: input.bio.length === 0 ? null : input.bio },
  });
}

export async function listStudentInterestSlugs(
  studentUserId: string,
): Promise<string[]> {
  const profile = await db.studentProfile.findUnique({
    where: { userId: studentUserId },
    select: {
      interests: { include: { subject: { select: { slug: true } } } },
    },
  });
  if (!profile) return [];
  return profile.interests.map((i) => i.subject.slug);
}
