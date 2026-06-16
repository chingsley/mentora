"use server";

import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(254),
  subject: z.string().trim().min(1, "Enter a subject").max(200),
  message: z.string().trim().min(1, "Enter a message").max(5000),
});

export type ContactFormResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function flatten(errors: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, messages] of Object.entries(errors)) {
    if (messages?.[0]) out[key] = messages[0];
  }
  return out;
}

/** Validates contact submissions. Wire to email/CRM when production messaging is ready. */
export async function submitContactFormAction(formData: FormData): Promise<ContactFormResult> {
  const parsed = contactFormSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }

  return { ok: true };
}
