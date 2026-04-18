"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  updatePolicy,
  updatePolicySchema,
  upsertRegionMinRateFormSchema,
  upsertRegionMinRateFromMajor,
} from "@/server/policies";

export type PolicyActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function updatePolicyAction(formData: FormData): Promise<PolicyActionResult> {
  await requireRole("ADMIN");
  const parsed = updatePolicySchema.safeParse({
    globalClassCap: formData.get("globalClassCap"),
    commissionPercent: formData.get("commissionPercent"),
    attendanceThresholdPct: formData.get("attendanceThresholdPct"),
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
  await updatePolicy(parsed.data);
  revalidatePath("/admin/policies");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateRegionMinRateAction(formData: FormData): Promise<void> {
  await requireRole("ADMIN");
  const parsed = upsertRegionMinRateFormSchema.safeParse({
    regionCode: formData.get("regionCode"),
    hourlyRateMajor: formData.get("hourlyRateMajor"),
  });
  if (!parsed.success) return;
  await upsertRegionMinRateFromMajor(parsed.data);
  revalidatePath("/admin/policies");
}
