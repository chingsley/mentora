"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  gradeSubmissionAction,
  type ActionResult,
} from "../actions";

export interface GradeSubmissionFormProps {
  submissionId: string;
  offeringId: string;
  assignmentId: string;
  initialGrade: number | null;
  initialFeedback: string;
}

export function GradeSubmissionForm({
  submissionId,
  offeringId,
  assignmentId,
  initialGrade,
  initialFeedback,
}: GradeSubmissionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("submissionId", submissionId);
    fd.set("offeringId", offeringId);
    fd.set("assignmentId", assignmentId);
    startTransition(async () => {
      const res = await gradeSubmissionAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  const fieldErrors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr_auto]">
      <Input
        name="grade"
        type="number"
        min={0}
        max={100}
        defaultValue={initialGrade ?? ""}
        placeholder="Grade /100"
        required
        label="Grade"
        error={fieldErrors?.grade}
      />
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-header">Feedback</span>
        <textarea
          name="feedback"
          rows={2}
          maxLength={5000}
          defaultValue={initialFeedback}
          className="w-full rounded-md border border-border bg-foreground p-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-header/30"
        />
      </label>
      <div className="flex items-end">
        <Button type="submit" isLoading={isPending}>
          Save
        </Button>
      </div>
      {result && !result.ok && !result.fieldErrors ? (
        <p className="sm:col-span-3 text-xs text-destructive">{result.error}</p>
      ) : null}
    </form>
  );
}
