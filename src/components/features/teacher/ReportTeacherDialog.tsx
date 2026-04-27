"use client";

import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
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

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const SuccessText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

const Hint = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const FieldLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
`;

const FieldLabelText = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Textarea = styled.textarea`
  width: 100%;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.TWO};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
  outline: none;
  resize: vertical;

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(23, 32, 51, 0.3);
  }
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${SPACING.TWO};
`;

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
        <Stack>
          <SuccessText>
            Thanks — admins have been notified. They&apos;ll review this report and follow up if
            needed. Your name stays hidden from the teacher.
          </SuccessText>
          <Footer>
            <Button
              type="button"
              onClick={() => {
                setResult(null);
                onClose();
              }}
            >
              Close
            </Button>
          </Footer>
        </Stack>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Hint>
            Reports are private and only visible to platform admins. Use reviews/ratings for
            general feedback instead.
          </Hint>
          <Select
            name="reason"
            label="Reason"
            defaultValue="HARASSMENT"
            options={REASON_OPTIONS}
          />
          <FieldLabel>
            <FieldLabelText>What happened?</FieldLabelText>
            <Textarea
              name="description"
              required
              minLength={10}
              maxLength={5000}
              rows={5}
            />
          </FieldLabel>
          {result && !result.ok ? <ErrorText>{result.error}</ErrorText> : null}
          <Footer>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Submit report
            </Button>
          </Footer>
        </Form>
      )}
    </Dialog>
  );
}
