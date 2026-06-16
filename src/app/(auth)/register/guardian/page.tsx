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
      lead="A student invited you as their guardian. Enter your full name and choose a password to complete setup and start following their progress."
    >
      <GuardianRegisterForm defaultEmail={email ?? ""} defaultCode={code ?? ""} />
    </AuthPageFrame>
  );
}
