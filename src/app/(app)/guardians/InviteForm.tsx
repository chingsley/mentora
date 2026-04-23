"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { inviteGuardianAction, type InviteGuardianResult } from "./actions";

export function InviteForm() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<InviteGuardianResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await inviteGuardianAction(fd);
      setResult(res);
      if (res.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  const err = result && !result.ok ? result.fieldErrors?.guardianEmail : undefined;

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            name="guardianEmail"
            type="email"
            label="Guardian email"
            placeholder="guardian@example.com"
            required
            error={err}
          />
        </div>
        <Button type="submit" isLoading={isPending}>
          Send invite
        </Button>
      </form>

      {result?.ok ? (
        <div className="rounded-md border border-border bg-background p-3 text-sm">
          <p className="font-medium text-header">Invite sent to {result.guardianEmail}</p>
          <p className="mt-1 text-muted-foreground">
            Ask your guardian to sign up at{" "}
            <span className="font-mono">/register/guardian</span> and enter the code below:
          </p>
          <p className="mt-2 font-mono text-lg tracking-widest text-header">
            {result.formattedCode}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The code is also in the email we just sent them.
          </p>
        </div>
      ) : null}

      {result && !result.ok && !result.fieldErrors ? (
        <p className="text-xs text-destructive">{result.error}</p>
      ) : null}
    </div>
  );
}
