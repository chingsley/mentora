import "server-only";
import { z } from "zod";
import { db } from "@/lib/db";

export const createTestimonialSchema = z.object({
  offeringId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(10, "Tell us a bit more").max(2000),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;

export class TestimonialNotAllowedError extends Error {
  constructor() {
    super("Only enrolled students can leave a testimonial for this class.");
  }
}

export async function listTestimonialsByOffering(offeringId: string) {
  return db.classTestimonial.findMany({
    where: { offeringId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      studentProfile: {
        include: {
          user: { select: { name: true, image: true } },
        },
      },
    },
  });
}

export async function listTestimonialsByTeacher(teacherProfileId: string) {
  return db.classTestimonial.findMany({
    where: { offering: { teacherProfileId } },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      offering: { select: { id: true, title: true, subject: { select: { name: true } } } },
      studentProfile: {
        include: {
          user: { select: { name: true, image: true } },
        },
      },
    },
  });
}

export async function createTestimonial(
  studentUserId: string,
  input: CreateTestimonialInput,
) {
  const student = await db.studentProfile.findUnique({
    where: { userId: studentUserId },
  });
  if (!student) throw new TestimonialNotAllowedError();

  const enrollment = await db.enrollment.findFirst({
    where: {
      studentProfileId: student.id,
      offeringId: input.offeringId,
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
    select: { id: true },
  });
  if (!enrollment) throw new TestimonialNotAllowedError();

  return db.classTestimonial.upsert({
    where: {
      offeringId_studentProfileId: {
        offeringId: input.offeringId,
        studentProfileId: student.id,
      },
    },
    create: {
      offeringId: input.offeringId,
      studentProfileId: student.id,
      rating: input.rating,
      body: input.body,
    },
    update: { rating: input.rating, body: input.body },
  });
}
