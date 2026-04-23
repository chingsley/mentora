"use server";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { joinClassSession } from "@/server/classSession";

export interface JoinAsStudentResult {
  ok: boolean;
  attendanceId?: string | null;
  error?: string;
}

export async function joinAsStudentAction(args: {
  offeringId: string;
}): Promise<JoinAsStudentResult> {
  const session = await requireRole("STUDENT");
  const student = await db.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!student) return { ok: false, error: "Student profile not found" };

  const enrollment = await db.enrollment.findUnique({
    where: {
      studentProfileId_offeringId: {
        studentProfileId: student.id,
        offeringId: args.offeringId,
      },
    },
    select: { id: true, status: true },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") {
    return { ok: false, error: "You are not enrolled in this class" };
  }

  try {
    const res = await joinClassSession({
      enrollmentId: enrollment.id,
      actorUserId: session.user.id,
      observer: false,
    });
    return { ok: true, attendanceId: res.attendanceId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not join" };
  }
}
