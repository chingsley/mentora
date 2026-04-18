import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";
import { EnrollmentFullError, computeCapacity } from "@/lib/capacity";
import { getPolicy } from "./policies";

export const enrollSchema = z.object({
  offeringIds: z.array(z.string().cuid()).min(1).max(20),
});

export type EnrollInput = z.infer<typeof enrollSchema>;

export async function enrollStudent(studentUserId: string, input: EnrollInput) {
  const student = await db.studentProfile.findUnique({ where: { userId: studentUserId } });
  if (!student) throw new Error("Student profile not found");

  const policy = await getPolicy();

  return db.$transaction(async (tx) => {
    const results: { offeringId: string; enrolled: boolean; reason?: string }[] = [];

    for (const offeringId of input.offeringIds) {
      const offering = await tx.classOffering.findUnique({
        where: { id: offeringId },
        include: {
          enrollments: { where: { status: "ACTIVE" }, select: { id: true } },
        },
      });
      if (!offering || !offering.active) {
        results.push({ offeringId, enrolled: false, reason: "Offering unavailable" });
        continue;
      }
      const capacity = computeCapacity({
        globalClassCap: policy.globalClassCap,
        teacherCap: offering.teacherCap,
        currentEnrolled: offering.enrollments.length,
      });
      if (capacity.isFull) {
        results.push({ offeringId, enrolled: false, reason: "Class period is full" });
        continue;
      }

      try {
        await tx.enrollment.create({
          data: {
            studentProfileId: student.id,
            offeringId,
            status: "ACTIVE",
          },
        });
        results.push({ offeringId, enrolled: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        if (message.includes("Unique constraint")) {
          results.push({ offeringId, enrolled: false, reason: "Already enrolled" });
        } else {
          throw err;
        }
      }
    }

    if (results.every((r) => !r.enrolled)) {
      throw new EnrollmentFullError();
    }

    return results;
  });
}

export const dropSchema = z.object({
  enrollmentId: z.string().cuid(),
});

export async function dropEnrollment(studentUserId: string, input: z.infer<typeof dropSchema>) {
  const student = await db.studentProfile.findUnique({ where: { userId: studentUserId } });
  if (!student) throw new Error("Student profile not found");

  return db.enrollment.updateMany({
    where: {
      id: input.enrollmentId,
      studentProfileId: student.id,
      status: "ACTIVE",
    },
    data: {
      status: "DROPPED",
      droppedAt: new Date(),
    },
  });
}

export async function listStudentEnrollments(studentUserId: string) {
  const student = await db.studentProfile.findUnique({ where: { userId: studentUserId } });
  if (!student) return [];
  return db.enrollment.findMany({
    where: { studentProfileId: student.id, status: "ACTIVE" },
    include: {
      offering: {
        include: {
          subject: true,
          teacherProfile: { include: { user: { select: { name: true } } } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}
