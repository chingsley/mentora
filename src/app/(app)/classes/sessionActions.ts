"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  addStudentSessionComment,
  sessionCommentSchema,
} from "@/server/sessionOccurrence";

export type SessionActionResult =
  | { ok: true; updatedAtIso: string }
  | { ok: false; error: string };

export async function addStudentSessionCommentAction(
  formData: FormData,
): Promise<SessionActionResult> {
  const session = await requireRole("STUDENT");
  const parsed = sessionCommentSchema.safeParse({
    enrollmentId: formData.get("enrollmentId"),
    sessionDate: formData.get("sessionDate"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid comment" };
  }
  try {
    const saved = await addStudentSessionComment(session.user.id, parsed.data);
    revalidatePath("/classes");
    return {
      ok: true,
      updatedAtIso: (saved.studentNoteUpdatedAt ?? saved.updatedAt).toISOString(),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not save comment" };
  }
}
