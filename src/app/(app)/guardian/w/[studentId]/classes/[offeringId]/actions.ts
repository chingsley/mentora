"use server";

import { requireRole } from "@/lib/auth";
import { assertGuardianHasStudent } from "@/server/guardians";
import { joinClassSession } from "@/server/classSession";
import { db } from "@/lib/db";

export interface JoinObserverResult {
  ok: boolean;
  error?: string;
}

export async function joinAsObserverAction(args: {
  studentProfileId: string;
  enrollmentId: string;
}): Promise<JoinObserverResult> {
  const session = await requireRole("GUARDIAN");
  try {
    await assertGuardianHasStudent(session.user.id, args.studentProfileId);
    const enrollment = await db.enrollment.findUnique({
      where: { id: args.enrollmentId },
      select: { studentProfileId: true },
    });
    if (!enrollment || enrollment.studentProfileId !== args.studentProfileId) {
      return { ok: false, error: "Enrollment does not belong to this ward." };
    }
    await joinClassSession({
      enrollmentId: args.enrollmentId,
      actorUserId: session.user.id,
      observer: true,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not join" };
  }
}
