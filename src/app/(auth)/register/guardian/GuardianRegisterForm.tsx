"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { guardianRegisterAction, type RegisterActionResult } from "../actions";

export interface GuardianRegisterFormProps {
  defaultEmail?: string;
  defaultCode?: string;
}

export function GuardianRegisterForm({ defaultEmail = "", defaultCode = "" }: GuardianRegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<RegisterActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await guardianRegisterAction(fd);
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
        label="Your email"
        autoComplete="email"
        required
        defaultValue={defaultEmail}
        hint="Use the same email the student invited."
        error={fieldErrors?.email}
      />
      <Input
        name="inviteCode"
        label="Invite code"
        placeholder="ABC-DEF-GHJ"
        required
        defaultValue={defaultCode}
        className="font-mono tracking-widest uppercase"
        hint="9 characters. Dashes are optional."
        error={fieldErrors?.inviteCode}
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
      {result && !result.ok && !result.fieldErrors ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : null}
      <Button type="submit" isLoading={isPending}>
        Create guardian account
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
