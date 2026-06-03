"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  ClassSessionError,
  endClassSession,
  joinClassSessionAsStudent,
  startClassSession,
} from "@/server/classSession";

export interface ClassroomActionResult {
  ok: boolean;
  error?: string;
}

function errorMessage(err: unknown): string {
  if (err instanceof ClassSessionError) return err.message;
  return "Something went wrong. Please try again.";
}

/** Teacher starts (or rejoins) the live session for a class they own. */
export async function startClassAction(
  offeringId: string,
): Promise<ClassroomActionResult> {
  const session = await requireRole("TEACHER");
  try {
    await startClassSession(session.user.id, offeringId);
    revalidatePath(`/classroom/${offeringId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

/** Teacher ends the live session. */
export async function endClassAction(
  offeringId: string,
): Promise<ClassroomActionResult> {
  const session = await requireRole("TEACHER");
  try {
    await endClassSession(session.user.id, offeringId);
    revalidatePath(`/classroom/${offeringId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}

/** Student records attendance when entering the live room. */
export async function registerStudentJoinAction(
  offeringId: string,
): Promise<ClassroomActionResult> {
  const session = await requireRole("STUDENT");
  try {
    await joinClassSessionAsStudent(session.user.id, offeringId);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
