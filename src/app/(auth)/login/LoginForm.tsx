"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginAction, type LoginActionResult } from "./actions";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<LoginActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await loginAction(fd);
      setResult(res);
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
        error={result && !result.ok ? result.fieldErrors?.email : undefined}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        required
        minLength={8}
        error={result && !result.ok ? result.fieldErrors?.password : undefined}
      />
      {result && !result.ok && !result.fieldErrors ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : null}
      <Button type="submit" isLoading={isPending}>
        Log in
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="font-medium text-header hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
