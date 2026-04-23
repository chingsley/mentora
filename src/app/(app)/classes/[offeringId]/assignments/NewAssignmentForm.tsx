"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createAssignmentAction, type ActionResult } from "./actions";

export interface NewAssignmentFormProps {
  offeringId: string;
}

export function NewAssignmentForm({ offeringId }: NewAssignmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("offeringId", offeringId);
    startTransition(async () => {
      const res = await createAssignmentAction(fd);
      setResult(res);
      if (res.ok) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  const fieldErrors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input name="title" label="Title" required minLength={3} error={fieldErrors?.title} />
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-header">Description</span>
        <textarea
          name="description"
          rows={3}
          maxLength={5000}
          className="w-full rounded-md border border-border bg-foreground p-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-header/30"
        />
      </label>
      <Input
        name="dueAt"
        type="datetime-local"
        label="Due date"
        required
        error={fieldErrors?.dueAt}
      />
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-header">Attachment (optional)</span>
        <input
          name="file"
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.zip"
          className="text-sm"
        />
        <span className="text-xs text-muted-foreground">Max 10 MB.</span>
      </label>
      {result && !result.ok && !result.fieldErrors ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : null}
      {result && result.ok ? (
        <p className="text-sm text-emerald-700">Assignment created.</p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" isLoading={isPending}>
          Post assignment
        </Button>
      </div>
    </form>
  );
}
