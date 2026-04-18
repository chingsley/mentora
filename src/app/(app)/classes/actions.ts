"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { dropEnrollment, dropSchema } from "@/server/enrollments";

export async function dropAction(formData: FormData): Promise<void> {
  const session = await requireRole("STUDENT");
  const parsed = dropSchema.safeParse({ enrollmentId: formData.get("enrollmentId") });
  if (!parsed.success) return;
  await dropEnrollment(session.user.id, parsed.data);
  revalidatePath("/classes");
}
