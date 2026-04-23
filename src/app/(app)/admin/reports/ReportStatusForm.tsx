"use client";

import type { ReportStatus } from "@prisma/client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { updateReportStatusAction } from "./actions";

export interface ReportStatusFormProps {
  reportId: string;
  currentStatus: ReportStatus;
}

export function ReportStatusForm({ reportId, currentStatus }: ReportStatusFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [status, setStatus] = React.useState<ReportStatus>(currentStatus);

  function submit(next: ReportStatus) {
    setStatus(next);
    const fd = new FormData();
    fd.set("reportId", reportId);
    fd.set("status", next);
    startTransition(async () => {
      await updateReportStatusAction(fd);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">Set status:</span>
      {(["OPEN", "REVIEWED", "DISMISSED"] as const).map((s) => (
        <Button
          key={s}
          type="button"
          size="sm"
          variant={status === s ? "primary" : "secondary"}
          onClick={() => submit(s)}
          isLoading={isPending && status === s}
        >
          {s[0] + s.slice(1).toLowerCase()}
        </Button>
      ))}
    </div>
  );
}
