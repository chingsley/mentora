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
      {result?.ok ? (
        <p className="text-xs text-success sm:max-w-xs sm:text-right">
          Invite sent. Share this link:{" "}
          <a href={result.link} className="underline">
            {result.link}
          </a>
        </p>
      ) : null}
      {result && !result.ok && !result.fieldErrors ? (
        <p className="text-xs text-destructive">{result.error}</p>
      ) : null}
    </form>
  );
}
