"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  updateReportStatus,
  updateReportStatusSchema,
} from "@/server/teacherReports";

export async function updateReportStatusAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireRole("ADMIN");
  const parsed = updateReportStatusSchema.safeParse({
    reportId: formData.get("reportId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" };
  }
  await updateReportStatus(parsed.data);
  revalidatePath("/admin/reports");
  return { ok: true };
}
