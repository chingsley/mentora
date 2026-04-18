"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { inviteGuardian, inviteGuardianSchema } from "@/server/guardians";

export type InviteGuardianResult =
  | { ok: true; link: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function inviteGuardianAction(formData: FormData): Promise<InviteGuardianResult> {
  const session = await requireRole("STUDENT");
  const parsed = inviteGuardianSchema.safeParse({
    guardianEmail: formData.get("guardianEmail"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      error: "Please provide a valid email.",
      fieldErrors: Object.fromEntries(
        Object.entries(flat).map(([k, v]) => [k, v?.[0] ?? ""]),
      ),
    };
  }
  try {
    const { link } = await inviteGuardian(session.user.id, parsed.data);
    revalidatePath("/guardians");
    return { ok: true, link };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not invite." };
  }
}
