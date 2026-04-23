"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/auth";
import {
  createAssignment,
  createAssignmentSchema,
  gradeSubmission,
  gradeSubmissionSchema,
  submitAssignment,
} from "@/server/assignments";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createAssignmentAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const parsed = createAssignmentSchema.safeParse({
    offeringId: formData.get("offeringId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    dueAt: formData.get("dueAt"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: Object.fromEntries(
        Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ""]),
      ),
    };
  }

  const file = formData.get("file");
  try {
    await createAssignment({
      teacherUserId: session.user.id,
      input: parsed.data,
      file: file instanceof File && file.size > 0 ? file : null,
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not create assignment" };
  }

  revalidatePath(`/classes/${parsed.data.offeringId}/assignments`);
  return { ok: true };
}

export async function submitAssignmentAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("STUDENT");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const offeringId = String(formData.get("offeringId") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to submit." };
  }
  try {
    await submitAssignment({
      studentUserId: session.user.id,
      assignmentId,
      file,
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not submit assignment" };
  }
  revalidatePath(`/classes/${offeringId}/assignments`);
  revalidatePath(`/classes/${offeringId}/assignments/${assignmentId}`);
  return { ok: true };
}

export async function gradeSubmissionAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const parsed = gradeSubmissionSchema.safeParse({
    submissionId: formData.get("submissionId"),
    grade: formData.get("grade"),
    feedback: formData.get("feedback") ?? "",
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: Object.fromEntries(
        Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ""]),
      ),
    };
  }
  try {
    await gradeSubmission({
      teacherUserId: session.user.id,
      input: parsed.data,
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not grade submission" };
  }
  const offeringId = String(formData.get("offeringId") ?? "");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (offeringId && assignmentId) {
    revalidatePath(`/classes/${offeringId}/assignments/${assignmentId}`);
  }
  return { ok: true };
}

export async function requireAuthed() {
  return requireSession();
}
