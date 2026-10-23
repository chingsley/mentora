"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useActionPending } from "@/hooks/useActionPending";
import styled from "styled-components";
import { removeTeacherWorkExperienceAction } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface TeacherProfileDeleteWorkExperienceTarget {
  id: string;
  company: string;
}

export interface TeacherProfileDeleteWorkExperienceDialogProps {
  target: TeacherProfileDeleteWorkExperienceTarget | null;
  onClose: () => void;
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

export function TeacherProfileDeleteWorkExperienceDialog({
  target,
  onClose,
}: TeacherProfileDeleteWorkExperienceDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useActionPending();
  const [error, setError] = React.useState<string | null>(null);

  const open = target !== null;

  React.useEffect(() => {
    if (open) setError(null);
  }, [open, target?.id]);

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function onConfirm() {
    if (!target) return;
    const fd = new FormData();
    fd.append("id", target.id);
    startTransition(async () => {
      const res = await removeTeacherWorkExperienceAction(fd);
      if (res.ok) {
        onClose();
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
      title={target ? `Remove ${target.company}?` : "Remove experience"}
      size="sm"
    >
      {target ? (
        <>
          <Body>This removes the role from your public profile. This cannot be undone.</Body>
          {error ? <ErrorText>{error}</ErrorText> : null}
          <Actions>
            <Button type="button" variant="secondary" disabled={isPending} onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" isLoading={isPending} onClick={onConfirm}>
              Remove
            </Button>
          </Actions>
        </>
      ) : null}
    </Dialog>
  );
}
