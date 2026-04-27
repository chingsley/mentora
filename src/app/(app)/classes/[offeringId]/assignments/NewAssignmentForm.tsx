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
import { createAssignmentAction, type ActionResult } from "./actions";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
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

export interface NewAssignmentFormProps {
  offeringId: string;
}

export function NewAssignmentForm({ offeringId }: NewAssignmentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("offeringId", offeringId);
    startTransition(async () => {
      const res = await createAssignmentAction(fd);
      setResult(res);
      if (res.ok) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  const fieldErrors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <Form ref={formRef} onSubmit={onSubmit}>
      <Input name="title" label="Title" required minLength={3} error={fieldErrors?.title} />
      <Field>
        <FieldLabel>Description</FieldLabel>
        <Textarea name="description" rows={3} maxLength={5000} />
      </Field>
      <Input
        name="dueAt"
        type="datetime-local"
        label="Due date"
        required
        error={fieldErrors?.dueAt}
      />
      <Field>
        <FieldLabel>Attachment (optional)</FieldLabel>
        <FileInput
          name="file"
          type="file"
          accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.zip"
        />
        <Hint>Max 10 MB.</Hint>
      </Field>
      {result && !result.ok && !result.fieldErrors ? (
        <ErrorText>{result.error}</ErrorText>
      ) : null}
      {result && result.ok ? <SuccessText>Assignment created.</SuccessText> : null}
      <Footer>
        <Button type="submit" isLoading={isPending}>
          Post assignment
        </Button>
      </Footer>
    </Form>
  );
}
