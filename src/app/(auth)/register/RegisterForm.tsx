"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { registerAction, type RegisterActionResult } from "./actions";

export interface RegionOption {
  code: string;
  name: string;
}

export interface RegisterFormProps {
  defaultRole?: "STUDENT" | "TEACHER";
  regions: RegionOption[];
}

export function RegisterForm({ defaultRole = "STUDENT", regions }: RegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<RegisterActionResult | null>(null);
  const [role, setRole] = React.useState<RegisterFormProps["defaultRole"]>(defaultRole);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await registerAction(fd);
      setResult(res);
      if (res.ok) {
        router.push(res.redirectTo);
        router.refresh();
      }
    });
  }

  const fieldErrors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Select
        name="role"
        label="I am signing up as"
        defaultValue={defaultRole}
        onChange={(e) => setRole(e.target.value as typeof role)}
        options={[
          { value: "STUDENT", label: "A student" },
          { value: "TEACHER", label: "A teacher" },
        ]}
      />
      <p className="text-xs text-muted-foreground">
        Signing up as a guardian? You need an invite code from your student.{" "}
        <Link href="/register/guardian" className="font-medium text-header hover:underline">
          Use guardian signup
        </Link>
        .
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="firstName"
          label="First name"
          autoComplete="given-name"
          required
          minLength={2}
          error={fieldErrors?.firstName}
        />
        <Input
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          required
          minLength={2}
          error={fieldErrors?.lastName}
        />
      </div>
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        error={fieldErrors?.email}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        error={fieldErrors?.password}
      />
      <Input
        name="confirmPassword"
        type="password"
        label="Confirm password"
        autoComplete="new-password"
        required
        minLength={8}
        error={fieldErrors?.confirmPassword}
      />
      <Select
        name="regionCode"
        label="Region (optional)"
        placeholder="Select your region"
        defaultValue=""
        options={regions.map((r) => ({ value: r.code, label: r.name }))}
      />
      {role === "STUDENT" ? (
        <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-header">
          Right after sign-up you&apos;ll set up your profile: photo, a short bio,
          and the subjects you want to learn (we use this to recommend teachers).
        </p>
      ) : null}
      {role === "TEACHER" ? (
        <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-header">
          After sign-up you&apos;ll finish your teacher profile: photo, subjects,
          rates, and weekly schedule.
        </p>
      ) : null}
      {result && !result.ok && !result.fieldErrors ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : null}
      <Button type="submit" isLoading={isPending}>
        Create account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-header hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
