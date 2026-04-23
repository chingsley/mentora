import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { listRegions } from "@/server/policies";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Create account" };

interface RegisterPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { role } = await searchParams;
  const regions = await listRegions();
  const defaultRole = role === "TEACHER" || role === "STUDENT" ? role : "STUDENT";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your Mentora account</CardTitle>
        <CardDescription>
          Join as a student, teacher, or guardian. It only takes a minute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm
          defaultRole={defaultRole}
          regions={regions.map((r) => ({ code: r.code, name: r.name }))}
        />
      </CardContent>
    </Card>
  );
}
