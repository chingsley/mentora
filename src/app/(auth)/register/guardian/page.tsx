import type { Metadata } from "next";
import { AuthPageFrame } from "../../AuthPageFrame";
import { GuardianRegisterForm } from "./GuardianRegisterForm";

export const metadata: Metadata = { title: "Guardian signup" };

interface Props {
  searchParams: Promise<{ email?: string; code?: string }>;
}

export default async function GuardianRegisterPage({ searchParams }: Props) {
  const { email, code } = await searchParams;

  return (
    <AuthPageFrame
      title="Guardian signup"
      lead="Your student shared an invite code with you. Enter it below to link your account to theirs."
    >
      <GuardianRegisterForm defaultEmail={email ?? ""} defaultCode={code ?? ""} />
    </AuthPageFrame>
  );
}
