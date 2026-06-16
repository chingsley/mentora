"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/lib/auth";
import { getTeacherProfileCompleted } from "@/server/teachers";
import { teacherProfileWelcomeHref } from "@/components/features/teacher/profile/teacherProfileSetup.constants";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
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
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    throw err;
  }

  const session = await auth();
  let redirectTo = "/dashboard";
  if (session?.user.role === "TEACHER") {
    const completed = await getTeacherProfileCompleted(session.user.id);
    if (completed === false) {
      redirectTo = teacherProfileWelcomeHref();
    }
  }

  return { ok: true, redirectTo };
}
