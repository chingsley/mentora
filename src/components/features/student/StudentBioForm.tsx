"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
  saveStudentBioAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";

export interface StudentBioFormProps {
  initial: { bio: string };
}

export function StudentBioForm({ initial }: StudentBioFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveStudentBioAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-header">About you</span>
        <textarea
          name="bio"
          rows={4}
          defaultValue={initial.bio}
          maxLength={2000}
          className="min-h-[6rem] w-full rounded-md border border-border bg-foreground px-3 py-2 text-sm text-text outline-none placeholder:text-muted-foreground hover:border-primary"
          placeholder="Share a bit about yourself — your goals, grade, or what you're preparing for."
        />
        {errs?.bio ? <p className="text-xs text-destructive">{errs.bio}</p> : null}
      </label>
      {result && !result.ok && !result.fieldErrors ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : null}
      <div>
        <Button type="submit" isLoading={isPending}>
          Save about you
        </Button>
      </div>
    </form>
  );
}
