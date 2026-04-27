"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  gradeSubmissionAction,
  type ActionResult,
} from "../actions";

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${SPACING.THREE};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: 160px 1fr auto;
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
`;

const FieldLabel = styled.span`
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
  font-family: inherit;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(23, 32, 51, 0.3);
  }
`;

const SubmitWrap = styled.div`
  display: flex;
  align-items: flex-end;
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};

  ${LAYOUT.MEDIA.SM} {
    grid-column: span 3;
  }
`;

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
    <Form onSubmit={onSubmit}>
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
      <Field>
        <FieldLabel>Feedback</FieldLabel>
        <Textarea
          name="feedback"
          rows={2}
          maxLength={5000}
          defaultValue={initialFeedback}
        />
      </Field>
      <SubmitWrap>
        <Button type="submit" isLoading={isPending}>
          Save
        </Button>
      </SubmitWrap>
      {result && !result.ok && !result.fieldErrors ? (
        <ErrorText>{result.error}</ErrorText>
      ) : null}
    </Form>
  );
}
