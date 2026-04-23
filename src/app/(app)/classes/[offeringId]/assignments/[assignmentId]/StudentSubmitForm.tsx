"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
  submitAssignmentAction,
  type ActionResult,
} from "../actions";

export interface StudentSubmitFormProps {
  offeringId: string;
  assignmentId: string;
  hasExisting: boolean;
}

export function StudentSubmitForm({ offeringId, assignmentId, hasExisting }: StudentSubmitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("offeringId", offeringId);
    fd.set("assignmentId", assignmentId);
    startTransition(async () => {
      const res = await submitAssignmentAction(fd);
      setResult(res);
      if (res.ok) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-header">
          {hasExisting ? "Replace submission" : "Upload your submission"}
        </span>
        <input
          name="file"
          type="file"
          required
          accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.zip"
          className="text-sm"
        />
        <span className="text-xs text-muted-foreground">
          Max 10 MB. Re-uploading clears any previous grade.
        </span>
      </label>
      {result && !result.ok ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : null}
      {result && result.ok ? (
        <p className="text-sm text-emerald-700">Submitted.</p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" isLoading={isPending}>
          {hasExisting ? "Replace file" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
