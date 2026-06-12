"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  ClassSessionError,
  endClassSession,
  joinClassSessionAsStudent,
  mintClassroomJitsiJwt,
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

export type MintJitsiJwtResult =
  | { ok: true; jwt: string }
  | { ok: false; error: string };

/** Issue a short-lived JaaS JWT after re-checking classroom access. */
export async function mintJitsiJwtAction(
  offeringId: string,
): Promise<MintJitsiJwtResult> {
  const session = await requireRole("TEACHER", "STUDENT");
  try {
    const jwt = await mintClassroomJitsiJwt(
      session.user.id,
      session.user.role,
      offeringId,
    );
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log(
        `[jitsi] minted JWT for offering ${offeringId} (user ${session.user.id}, role ${session.user.role})`,
      );
    }
    return { ok: true, jwt };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[jitsi] JWT mint failed:", errorMessage(err));
    }
    return { ok: false, error: errorMessage(err) };
  }
}
