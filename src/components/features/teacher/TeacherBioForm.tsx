"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { saveBioAction, type ActionResult } from "@/app/(app)/profile/actions";

export interface TeacherBioFormProps {
  initial: { headline: string; bio: string };
}

export function TeacherBioForm({ initial }: TeacherBioFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveBioAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input
        name="headline"
        label="Headline"
        placeholder="e.g. Senior Maths Teacher, 10+ yrs"
        defaultValue={initial.headline}
        required
        error={errs?.headline}
        hint="A short line students see on your card."
      />
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-header">About you</span>
        <textarea
          name="bio"
          rows={5}
          defaultValue={initial.bio}
          maxLength={2000}
          className="min-h-[7rem] w-full rounded-md border border-border bg-foreground px-3 py-2 text-sm text-text outline-none placeholder:text-muted-foreground hover:border-primary"
          placeholder="Tell students about your teaching experience and style."
        />
        {errs?.bio ? <p className="text-xs text-destructive">{errs.bio}</p> : null}
      </label>
      {result && !result.ok && !result.fieldErrors ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : null}
      <div>
        <Button type="submit" isLoading={isPending}>
          Save profile details
        </Button>
      </div>
    </form>
  );
}
