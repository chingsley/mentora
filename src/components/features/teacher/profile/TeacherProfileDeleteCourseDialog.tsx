"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { removeTeacherCourseAction } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface TeacherProfileDeleteCourseTarget {
  subjectId: string;
  subjectName: string;
  studentCount: number;
}

export interface TeacherProfileDeleteCourseDialogProps {
  target: TeacherProfileDeleteCourseTarget | null;
  onClose: () => void;
}

const Body = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.TEXT};
`;

const Warning = styled.p`
  margin: ${SPACING.THREE} 0 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
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

export function TeacherProfileDeleteCourseDialog({
  target,
  onClose,
}: TeacherProfileDeleteCourseDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const open = target !== null;
  const blocked = (target?.studentCount ?? 0) > 0;

  React.useEffect(() => {
    if (open) setError(null);
  }, [open, target?.subjectId]);

  function handleClose() {
    if (isPending) return;
    onClose();
  }

  function onConfirm() {
    if (!target || blocked) return;
    const fd = new FormData();
    fd.append("subjectId", target.subjectId);
    startTransition(async () => {
      const res = await removeTeacherCourseAction(fd);
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
      title={target ? `Remove ${target.subjectName}?` : "Remove course"}
      size="sm"
    >
      {target ? (
        <>
          <Body>
            This removes the course from your profile, including its hourly rate
            {target.studentCount === 0 ? " and any scheduled class periods for this subject" : ""}.
            This cannot be undone.
          </Body>
          {blocked ? (
            <Warning>
              {target.studentCount} student{target.studentCount === 1 ? "" : "s"} still enrolled in
              this subject. Cancel enrollments or adjust your schedule before removing the course.
            </Warning>
          ) : null}
          {error ? <ErrorText>{error}</ErrorText> : null}
          <Actions>
            <Button type="button" variant="secondary" disabled={isPending} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              isLoading={isPending}
              disabled={blocked || isPending}
              onClick={onConfirm}
            >
              Remove course
            </Button>
          </Actions>
        </>
      ) : null}
    </Dialog>
  );
}
