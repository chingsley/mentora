"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  submitAssignmentAction,
  type ActionResult,
} from "../actions";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
`;

const LabelText = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const FileInput = styled.input`
  font-size: ${FONTS.SIZE.SM};
`;

const Hint = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const SuccessText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: #047857;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

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
    <Form ref={formRef} onSubmit={onSubmit}>
      <Label>
        <LabelText>
          {hasExisting ? "Replace submission" : "Upload your submission"}
        </LabelText>
        <FileInput
          name="file"
          type="file"
          required
          accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.zip"
        />
        <Hint>Max 10 MB. Re-uploading clears any previous grade.</Hint>
      </Label>
      {result && !result.ok ? <ErrorText>{result.error}</ErrorText> : null}
      {result && result.ok ? <SuccessText>Submitted.</SuccessText> : null}
      <Footer>
        <Button type="submit" isLoading={isPending}>
          {hasExisting ? "Replace file" : "Submit"}
        </Button>
      </Footer>
    </Form>
  );
}
