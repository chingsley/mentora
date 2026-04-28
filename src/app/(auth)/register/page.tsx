import type { Metadata } from "next";
import type { AuthRegisterRole } from "../AuthFormControls";
import { AuthPageFrame } from "../AuthPageFrame";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Create account" };

interface RegisterPageProps {
  searchParams: Promise<{ role?: string; }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { role } = await searchParams;
  const defaultRole: AuthRegisterRole =
    role === "TEACHER" || role === "STUDENT" || role === "GUARDIAN" ? role : "STUDENT";

  return (
    <AuthPageFrame
      title="Register"
      lead="Join as a student, teacher, or guardian. It only takes a minute."
    >
      <RegisterForm defaultRole={defaultRole} />
    </AuthPageFrame>
  );
}
