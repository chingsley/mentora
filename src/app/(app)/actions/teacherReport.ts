"use server";

import { requireSession } from "@/lib/auth";
import {
  createTeacherReport,
  createTeacherReportSchema,
} from "@/server/teacherReports";

export type SubmitTeacherReportResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitTeacherReportAction(
  formData: FormData,
): Promise<SubmitTeacherReportResult> {
  const session = await requireSession();
  if (session.user.role !== "STUDENT" && session.user.role !== "GUARDIAN") {
    return { ok: false, error: "Only students and guardians can report teachers." };
  }

  const parsed = createTeacherReportSchema.safeParse({
    teacherProfileId: formData.get("teacherProfileId"),
    reason: formData.get("reason"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const first =
      flat.description?.[0] ?? flat.reason?.[0] ?? flat.teacherProfileId?.[0] ?? "Invalid input";
    return { ok: false, error: first };
  }

  try {
    await createTeacherReport({
      reporterUserId: session.user.id,
      input: parsed.data,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not submit report" };
  }
}
