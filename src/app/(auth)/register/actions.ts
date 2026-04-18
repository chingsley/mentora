"use server";

import { signIn } from "@/lib/auth";
import { registerSchema, registerUser, EmailTakenError } from "@/server/users";

export type RegisterActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function registerAction(formData: FormData): Promise<RegisterActionResult> {
  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role"),
    regionCode: formData.get("regionCode") || undefined,
    bio: formData.get("bio") || undefined,
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

  const redirectTo = parsed.data.role === "TEACHER" ? "/profile" : "/dashboard";
  return { ok: true, redirectTo };
}
