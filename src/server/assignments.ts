import "server-only";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  fileExtension,
  safeMimeFor,
  validateAssignmentUpload,
} from "@/lib/uploads";
import { storageProvider } from "@/lib/providers/storage";
import { assertGuardianHasStudent } from "./guardians";

export const createAssignmentSchema = z.object({
  offeringId: z.string().cuid(),
  title: z.string().trim().min(3, "Title is required.").max(200),
  description: z.string().trim().max(5000).default(""),
  dueAt: z.coerce.date(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

async function requireTeacherForOffering(teacherUserId: string, offeringId: string) {
  const offering = await db.classOffering.findUnique({
    where: { id: offeringId },
    include: { teacherProfile: { select: { id: true, userId: true } } },
  });
  if (!offering) throw new Error("Offering not found");
  if (offering.teacherProfile.userId !== teacherUserId) {
    throw new Error("Forbidden: you do not teach this offering");
  }
  return offering;
}

async function persistUpload(
  prefix: string,
  file: File,
): Promise<{ filePath: string; mime: string; size: number } | null> {
  if (!file || file.size === 0) return null;
  const validation = validateAssignmentUpload(file);
  if (!validation.ok) throw new Error(validation.error);
  const extension = validation.extension ?? fileExtension(file.name) ?? "bin";
  const name = `${randomBytes(8).toString("hex")}.${extension}`;
  const key = path.posix.join(prefix, name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = safeMimeFor(file.type || null, extension);
  const saved = await storageProvider.upload({
    key,
    body: buffer,
    contentType: mime,
  });
  return { filePath: saved.key, mime, size: saved.size };
}

export async function createAssignment(args: {
  teacherUserId: string;
  input: CreateAssignmentInput;
  file?: File | null;
}) {
  const offering = await requireTeacherForOffering(args.teacherUserId, args.input.offeringId);

  const assignmentId = randomBytes(16).toString("hex");
  const upload = args.file
    ? await persistUpload(`assignments/${offering.id}/${assignmentId}`, args.file)
    : null;

  const assignment = await db.assignment.create({
    data: {
      offeringId: offering.id,
      teacherProfileId: offering.teacherProfile.id,
      title: args.input.title,
      description: args.input.description,
      dueAt: args.input.dueAt,
      attachmentPath: upload?.filePath,
      attachmentMime: upload?.mime,
      attachmentSize: upload?.size,
    },
  });
  return assignment;
}

export const submitAssignmentSchema = z.object({
  assignmentId: z.string().cuid(),
});

export async function submitAssignment(args: {
  studentUserId: string;
  assignmentId: string;
  file: File;
}) {
  if (!args.file || args.file.size === 0) throw new Error("Choose a file to submit.");
  const student = await db.studentProfile.findUnique({
    where: { userId: args.studentUserId },
  });
  if (!student) throw new Error("Student profile not found");

  const assignment = await db.assignment.findUnique({
    where: { id: args.assignmentId },
    include: { offering: { select: { id: true } } },
  });
  if (!assignment) throw new Error("Assignment not found");

  const enrollment = await db.enrollment.findUnique({
    where: {
      studentProfileId_offeringId: {
        studentProfileId: student.id,
        offeringId: assignment.offering.id,
      },
    },
    select: { id: true, status: true },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") {
    throw new Error("You are not enrolled in this class.");
  }

  const upload = await persistUpload(
    `submissions/${assignment.id}`,
    args.file,
  );
  if (!upload) throw new Error("Choose a file to submit.");

  return db.assignmentSubmission.upsert({
    where: {
      assignmentId_studentProfileId: {
        assignmentId: assignment.id,
        studentProfileId: student.id,
      },
    },
    create: {
      assignmentId: assignment.id,
      studentProfileId: student.id,
      filePath: upload.filePath,
      fileMime: upload.mime,
      fileSize: upload.size,
    },
    update: {
      filePath: upload.filePath,
      fileMime: upload.mime,
      fileSize: upload.size,
      submittedAt: new Date(),
      grade: null,
      feedback: null,
      gradedAt: null,
      gradedByUserId: null,
    },
  });
}

export const gradeSubmissionSchema = z.object({
  submissionId: z.string().cuid(),
  grade: z.coerce.number().int().min(0).max(100),
  feedback: z.string().trim().max(5000).optional().default(""),
});

export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;

export async function gradeSubmission(args: {
  teacherUserId: string;
  input: GradeSubmissionInput;
}) {
  const submission = await db.assignmentSubmission.findUnique({
    where: { id: args.input.submissionId },
    include: {
      assignment: {
        include: {
          offering: { include: { teacherProfile: { select: { userId: true } } } },
        },
      },
    },
  });
  if (!submission) throw new Error("Submission not found");
  if (submission.assignment.offering.teacherProfile.userId !== args.teacherUserId) {
    throw new Error("Forbidden: you do not teach this class");
  }
  return db.assignmentSubmission.update({
    where: { id: submission.id },
    data: {
      grade: args.input.grade,
      feedback: args.input.feedback ?? "",
      gradedAt: new Date(),
      gradedByUserId: args.teacherUserId,
    },
  });
}

export async function listAssignmentsForOffering(offeringId: string) {
  return db.assignment.findMany({
    where: { offeringId },
    orderBy: { dueAt: "asc" },
    include: {
      submissions: {
        include: {
          studentProfile: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
    },
  });
}

export async function listAssignmentsForStudent(studentProfileId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { studentProfileId, status: "ACTIVE" },
    select: { offeringId: true },
  });
  const offeringIds = enrollments.map((e) => e.offeringId);
  if (offeringIds.length === 0) return [];

  return db.assignment.findMany({
    where: { offeringId: { in: offeringIds } },
    orderBy: { dueAt: "asc" },
    include: {
      offering: { include: { subject: true } },
      submissions: {
        where: { studentProfileId },
      },
    },
  });
}

export async function listAssignmentsForStudentUser(studentUserId: string) {
  const student = await db.studentProfile.findUnique({
    where: { userId: studentUserId },
  });
  if (!student) return [];
  return listAssignmentsForStudent(student.id);
}

export async function listAssignmentsForGuardianWard(args: {
  guardianUserId: string;
  studentProfileId: string;
}) {
  await assertGuardianHasStudent(args.guardianUserId, args.studentProfileId);
  return listAssignmentsForStudent(args.studentProfileId);
}

export async function getAssignmentForTeacher(args: {
  teacherUserId: string;
  assignmentId: string;
}) {
  const assignment = await db.assignment.findUnique({
    where: { id: args.assignmentId },
    include: {
      offering: {
        include: {
          subject: true,
          teacherProfile: { select: { id: true, userId: true } },
        },
      },
      submissions: {
        include: {
          studentProfile: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
    },
  });
  if (!assignment) return null;
  if (assignment.offering.teacherProfile.userId !== args.teacherUserId) {
    throw new Error("Forbidden");
  }
  return assignment;
}

export async function getAssignmentForStudent(args: {
  studentUserId: string;
  assignmentId: string;
}) {
  const student = await db.studentProfile.findUnique({
    where: { userId: args.studentUserId },
  });
  if (!student) return null;
  const assignment = await db.assignment.findUnique({
    where: { id: args.assignmentId },
    include: {
      offering: { include: { subject: true, teacherProfile: { include: { user: { select: { name: true } } } } } },
      submissions: { where: { studentProfileId: student.id } },
    },
  });
  if (!assignment) return null;

  const enrollment = await db.enrollment.findFirst({
    where: {
      studentProfileId: student.id,
      offeringId: assignment.offeringId,
      status: "ACTIVE",
    },
    select: { id: true },
  });
  if (!enrollment) throw new Error("Forbidden");
  return {
    assignment,
    mySubmission: assignment.submissions[0] ?? null,
    studentProfileId: student.id,
  };
}
