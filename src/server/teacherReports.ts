import "server-only";
import { z } from "zod";
import type { ReportStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const REPORT_REASONS = [
  "HARASSMENT",
  "NO_SHOW",
  "INAPPROPRIATE_CONTENT",
  "UNPROFESSIONAL",
  "OTHER",
] as const;

export const REPORT_REASON_LABELS: Record<(typeof REPORT_REASONS)[number], string> = {
  HARASSMENT: "Harassment or abuse",
  NO_SHOW: "Teacher didn't show up",
  INAPPROPRIATE_CONTENT: "Inappropriate content",
  UNPROFESSIONAL: "Unprofessional behavior",
  OTHER: "Other",
};

export const createTeacherReportSchema = z.object({
  teacherProfileId: z.string().cuid(),
  reason: z.enum(REPORT_REASONS),
  description: z
    .string()
    .trim()
    .min(10, "Please share a few details so admins can follow up.")
    .max(5000, "Too long."),
});

export type CreateTeacherReportInput = z.infer<typeof createTeacherReportSchema>;

export async function createTeacherReport(args: {
  reporterUserId: string;
  input: CreateTeacherReportInput;
}) {
  const user = await db.user.findUnique({
    where: { id: args.reporterUserId },
    select: { role: true },
  });
  if (!user) throw new Error("User not found");

  if (user.role !== "STUDENT" && user.role !== "GUARDIAN") {
    throw new Error("Only students or guardians can submit teacher reports.");
  }

  const teacher = await db.teacherProfile.findUnique({
    where: { id: args.input.teacherProfileId },
    select: { id: true },
  });
  if (!teacher) throw new Error("Teacher not found");

  return db.teacherReport.create({
    data: {
      teacherProfileId: args.input.teacherProfileId,
      reporterUserId: args.reporterUserId,
      reporterRole: user.role,
      reason: args.input.reason,
      description: args.input.description,
    },
  });
}

export async function listReportsForAdmin(filter?: { status?: ReportStatus }) {
  return db.teacherReport.findMany({
    where: filter?.status ? { status: filter.status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      teacherProfile: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    take: 200,
  });
}

export const updateReportStatusSchema = z.object({
  reportId: z.string().cuid(),
  status: z.enum(["OPEN", "REVIEWED", "DISMISSED"]),
});

export async function updateReportStatus(input: z.infer<typeof updateReportStatusSchema>) {
  return db.teacherReport.update({
    where: { id: input.reportId },
    data: { status: input.status },
  });
}
