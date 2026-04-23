import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ email?: string }>;
}

/**
 * Legacy tokenized invite URL. The current flow uses a 9-character invite
 * code entered on the guardian signup page, so we just redirect there.
 */
export default async function LegacyAcceptInvitePage({ searchParams }: Props) {
  const { email } = await searchParams;
  const qs = email ? `?email=${encodeURIComponent(email)}` : "";
  redirect(`/register/guardian${qs}`);
}
