import "server-only";
import { env } from "@/lib/env";
import { formatInviteCode } from "@/lib/inviteCode";

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

/**
 * Development-friendly mailer seam. In production, swap this out for Resend /
 * SMTP without touching callers.
 */
export async function sendEmail({ to, subject, text }: SendEmailInput): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    // Production provider hook goes here (Resend, SES, SMTP, ...).
    // For now we still log, so deployments surface the message until wired.
    // eslint-disable-next-line no-console -- dev-only logging until a real mailer is wired up
    console.info(`[mentora][mail] to=${to} subject=${subject}`);
    // eslint-disable-next-line no-console -- dev-only logging until a real mailer is wired up
    console.info(text);
    return;
  }
  // eslint-disable-next-line no-console -- dev-only preview of emails
  console.info(
    `\n================ MENTORA EMAIL (dev) ================\n` +
      `From:    ${env.EMAIL_FROM}\n` +
      `To:      ${to}\n` +
      `Subject: ${subject}\n` +
      `---\n` +
      `${text}\n` +
      `=====================================================\n`,
  );
}

export interface SendGuardianInviteInput {
  to: string;
  studentName: string;
  inviteCode: string;
}

export async function sendGuardianInviteEmail(input: SendGuardianInviteInput): Promise<void> {
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const signupUrl = `${base}/register/guardian`;
  const display = formatInviteCode(input.inviteCode);
  const text = [
    `Hello,`,
    ``,
    `${input.studentName} has invited you to join Mentora as their guardian.`,
    ``,
    `Your invite code: ${display}`,
    ``,
    `To accept:`,
    `1. Go to ${signupUrl}`,
    `2. Enter your email (${input.to}), the invite code above, and choose a password.`,
    ``,
    `If you already have a guardian account, sign in and the invite will be applied automatically.`,
    ``,
    `- The Mentora team`,
  ].join("\n");

  await sendEmail({
    to: input.to,
    subject: `Mentora guardian invite for ${input.studentName}`,
    text,
  });
}
