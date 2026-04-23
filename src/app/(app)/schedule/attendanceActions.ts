"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  markAttendance,
  markAttendanceSchema,
} from "@/server/attendance";

export type MarkAttendanceResult = { ok: true } | { ok: false; error: string };

export async function markAttendanceAction(
  formData: FormData,
): Promise<MarkAttendanceResult> {
  const session = await requireRole("TEACHER");
  const parsed = markAttendanceSchema.safeParse({
    enrollmentId: formData.get("enrollmentId"),
    sessionDate: formData.get("sessionDate"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  try {
    await markAttendance(session.user.id, parsed.data);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not mark attendance" };
  }
  revalidatePath("/schedule");
  return { ok: true };
}
