"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { submitTeacherReportAction } from "@/app/(app)/actions/teacherReport";

const REASON_OPTIONS = [
  { value: "HARASSMENT", label: "Harassment or abuse" },
  { value: "NO_SHOW", label: "Teacher didn't show up" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate content" },
  { value: "UNPROFESSIONAL", label: "Unprofessional behavior" },
  { value: "OTHER", label: "Other" },
];

export interface ReportTeacherDialogProps {
  open: boolean;
  onClose: () => void;
  teacherProfileId: string;
  teacherName: string;
}

export function ReportTeacherDialog({
  open,
  onClose,
  teacherProfileId,
  teacherName,
}: ReportTeacherDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<
    { ok: true } | { ok: false; error: string } | null
  >(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("teacherProfileId", teacherProfileId);
    startTransition(async () => {
      const res = await submitTeacherReportAction(fd);
      setResult(res);
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Report ${teacherName}`}>
      {result?.ok ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-text/80">
            Thanks — admins have been notified. They&apos;ll review this report and follow up if
            needed. Your name stays hidden from the teacher.
          </p>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                setResult(null);
                onClose();
              }}
            >
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Reports are private and only visible to platform admins. Use reviews/ratings for
            general feedback instead.
          </p>
          <Select
            name="reason"
            label="Reason"
            defaultValue="HARASSMENT"
            options={REASON_OPTIONS}
          />
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-header">What happened?</span>
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={5000}
              rows={5}
              className="w-full rounded-md border border-border bg-foreground p-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-header/30"
            />
          </label>
          {result && !result.ok ? (
            <p className="text-xs text-destructive">{result.error}</p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Submit report
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
