"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  getTeacherSessionAttendance,
  markAttendance,
  markAttendanceSchema,
} from "@/server/attendance";
import {
  markSessionHeld,
  markSessionNotHeld,
  markSessionNotHeldSchema,
} from "@/server/sessionOccurrence";

export type MarkAttendanceResult = { ok: true } | { ok: false; error: string };

export type TeacherSessionAttendancePayload = Awaited<
  ReturnType<typeof getTeacherSessionAttendance>
>;

export async function markAttendanceAction(
  formData: FormData,
): Promise<MarkAttendanceResult> {
  const session = await requireRole("TEACHER");
  const parsed = markAttendanceSchema.safeParse({
    enrollmentId: formData.get("enrollmentId"),
    sessionDate: formData.get("sessionDate"),
    status: formData.get("status"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { ok: false, error: message };
  }
  try {
    await markAttendance(session.user.id, parsed.data);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not mark attendance" };
  }
  revalidatePath("/schedule");
  return { ok: true };
}

export async function getTeacherSessionAttendanceAction(
  offeringId: string,
  sessionDateIso: string,
): Promise<
  | { ok: true; data: TeacherSessionAttendancePayload }
  | { ok: false; error: string }
> {
  const session = await requireRole("TEACHER");
  if (!offeringId || !sessionDateIso) {
    return { ok: false, error: "Invalid input" };
  }
  try {
    const data = await getTeacherSessionAttendance(
      session.user.id,
      offeringId,
      sessionDateIso,
    );
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not load attendance",
    };
  }
}

export async function markSessionNotHeldAction(
  formData: FormData,
): Promise<MarkAttendanceResult> {
  const session = await requireRole("TEACHER");
  const parsed = markSessionNotHeldSchema.safeParse({
    offeringId: formData.get("offeringId"),
    sessionDate: formData.get("sessionDate"),
    notHeldReason: formData.get("notHeldReason"),
    teacherNote: formData.get("teacherNote") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  try {
    await markSessionNotHeld(session.user.id, parsed.data);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not mark session",
    };
  }
  revalidatePath("/schedule");
  revalidatePath("/classes");
  return { ok: true };
}

export async function markSessionHeldAction(
  formData: FormData,
): Promise<MarkAttendanceResult> {
  const session = await requireRole("TEACHER");
  const offeringId = formData.get("offeringId");
  const sessionDate = formData.get("sessionDate");
  if (typeof offeringId !== "string" || typeof sessionDate !== "string") {
    return { ok: false, error: "Invalid input" };
  }
  try {
    await markSessionHeld(session.user.id, offeringId, sessionDate);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not mark session",
    };
  }
  revalidatePath("/schedule");
  revalidatePath("/classes");
  return { ok: true };
}
