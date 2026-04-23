import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { GuardianRegisterForm } from "./GuardianRegisterForm";

export const metadata: Metadata = { title: "Guardian signup" };

interface Props {
  searchParams: Promise<{ email?: string; code?: string }>;
}

export default async function GuardianRegisterPage({ searchParams }: Props) {
  const { email, code } = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guardian signup</CardTitle>
        <CardDescription>
          Your student shared an invite code with you. Enter it below to link your account to
          theirs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GuardianRegisterForm defaultEmail={email ?? ""} defaultCode={code ?? ""} />
      </CardContent>
    </Card>
  );
}
