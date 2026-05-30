"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { deleteOfferingAction } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface OfferingDeletePeriodTarget {
  offeringId: string;
  enrolled: number;
}

export interface OfferingDeletePeriodDialogProps {
  target: OfferingDeletePeriodTarget | null;
  onClose: () => void;
  onDeleted: () => void;
}

const Body = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.TEXT};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${SPACING.TWO};
  margin-top: ${SPACING.FIVE};
`;

const ErrorText = styled.p`
  margin: ${SPACING.THREE} 0 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

function deletePeriodMessage(enrolled: number): string {
  if (enrolled === 0) {
    return "No students are enrolled. Deleting removes this period from your schedule.";
  }
  if (enrolled === 1) {
    return "1 student is currently enrolled. Deleting cancels their enrollment and removes this period.";
  }
  return `${enrolled} students are currently enrolled. Deleting cancels their enrollments and removes this period.`;
}

export function OfferingDeletePeriodDialog({
  target,
  onClose,
  onDeleted,
}: OfferingDeletePeriodDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const open = target !== null;

  React.useEffect(() => {
    if (open) setError(null);
  }, [open, target?.offeringId]);

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function onConfirm() {
    if (!target) return;
    const fd = new FormData();
    fd.append("offeringId", target.offeringId);
    startTransition(async () => {
      const res = await deleteOfferingAction(fd);
      if (res.ok) {
        onClose();
        onDeleted();
        router.refresh();
        return;
      }
      setError(res.error);
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Delete class period?"
      size="sm"
    >
      {target ? (
        <>
          <Body>
            {deletePeriodMessage(target.enrolled)} This cannot be undone.
          </Body>
          {error ? <ErrorText>{error}</ErrorText> : null}
          <Actions>
            <Button type="button" variant="secondary" disabled={isPending} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              isLoading={isPending}
              disabled={isPending}
              onClick={onConfirm}
            >
              Delete period
            </Button>
          </Actions>
        </>
      ) : null}
    </Dialog>
  );
}
