"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { enrollStudent, enrollSchema } from "@/server/enrollments";

export type EnrollResult =
  | { ok: true; results: { offeringId: string; enrolled: boolean; reason?: string }[] }
  | { ok: false; error: string };

export async function enrollAction(formData: FormData): Promise<EnrollResult> {
  const session = await requireRole("STUDENT");
  const offeringIds = formData.getAll("offeringId").map(String);
  const parsed = enrollSchema.safeParse({ offeringIds });
  if (!parsed.success) {
    return { ok: false, error: "Select at least one period." };
  }
  try {
    const results = await enrollStudent(session.user.id, parsed.data);
    revalidatePath("/classes");
    return { ok: true, results };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not enroll.",
    };
  }
}
