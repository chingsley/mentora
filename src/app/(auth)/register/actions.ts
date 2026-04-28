"use server";

import { signIn } from "@/lib/auth";
import { registerUser, EmailTakenError } from "@/server/users";
import {
  guardianRegisterSchema,
  registerSchema,
} from "@/server/schemas/register";
import { claimGuardianInvite } from "@/server/guardians";
import { normalizeInviteCode } from "@/lib/inviteCode";
import { db } from "@/lib/db";

export type RegisterActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function registerAction(formData: FormData): Promise<RegisterActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
  };

  const parsed = registerSchema.safeParse(raw);
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

  if (parsed.data.role === "GUARDIAN") {
    return {
      ok: false,
      error: "Guardians sign up with an invite code.",
      fieldErrors: { role: "Use the guardian invite link" },
    };
  }

  try {
    await registerUser(parsed.data);
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return { ok: false, error: err.message, fieldErrors: { email: err.message } };
    }
    throw err;
  }

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });

  const redirectTo =
    parsed.data.role === "TEACHER" || parsed.data.role === "STUDENT"
      ? "/profile"
      : "/dashboard";
  return { ok: true, redirectTo };
}

export async function guardianRegisterAction(
  formData: FormData,
): Promise<RegisterActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    inviteCode: formData.get("inviteCode"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = guardianRegisterSchema.safeParse(raw);
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

  const email = parsed.data.email.trim().toLowerCase();
  const code = normalizeInviteCode(parsed.data.inviteCode);

  const link = await db.guardianLink.findUnique({ where: { inviteCode: code } });
  if (!link || link.status !== "PENDING") {
    return {
      ok: false,
      error: "That invite code is not valid.",
      fieldErrors: { inviteCode: "Invalid or already used" },
    };
  }
  if (link.guardianEmail.toLowerCase() !== email) {
    return {
      ok: false,
      error: "This invite code was sent to a different email.",
      fieldErrors: { email: "Email doesn't match the invite" },
    };
  }

  try {
    await registerUser({
      name: parsed.data.name,
      email,
      password: parsed.data.password,
      confirmPassword: parsed.data.confirmPassword,
      role: "GUARDIAN",
    });
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return {
        ok: false,
        error:
          "An account already exists for this email. Please log in, and the invite will be applied.",
        fieldErrors: { email: err.message },
      };
    }
    throw err;
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) {
    return { ok: false, error: "Account could not be created." };
  }

  try {
    await claimGuardianInvite({
      guardianUserId: user.id,
      email,
      inviteCode: code,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not link guardian invite.",
    };
  }

  await signIn("credentials", {
    email,
    password: parsed.data.password,
    redirect: false,
  });

  return { ok: true, redirectTo: "/guardian" };
}
