"use client";

import type { ReportStatus } from "@prisma/client";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import { updateReportStatusAction } from "./actions";

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const Label = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

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
    <Wrap>
      <Label>Set status:</Label>
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
    </Wrap>
  );
}
