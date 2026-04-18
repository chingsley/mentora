"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { acceptGuardianInvite } from "@/server/guardians";

export async function acceptInviteAction(formData: FormData) {
  const session = await requireRole("GUARDIAN");
  const token = String(formData.get("token") ?? "");
  const email = String(formData.get("email") ?? "");
  try {
    await acceptGuardianInvite({
      token,
      email,
      guardianUserId: session.user.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not accept invite";
    redirect(
      `/guardians/accept?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&error=${encodeURIComponent(message)}`,
    );
  }
  redirect(
    `/guardians/accept?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&ok=1`,
  );
}
