"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  saveStudentBioAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";

export interface StudentBioFormProps {
  initial: { bio: string };
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const FieldLabel = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Textarea = styled.textarea`
  min-height: 6rem;
  width: 100%;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
  outline: none;
  resize: vertical;

  &::placeholder {
    color: ${COLORS.MUTED_FOREGROUND};
  }

  &:hover {
    border-color: ${COLORS.PRIMARY};
  }

  &:focus {
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const FieldError = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

export function StudentBioForm({ initial }: StudentBioFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveStudentBioAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <Form onSubmit={onSubmit}>
      <Field>
        <FieldLabel>About you</FieldLabel>
        <Textarea
          name="bio"
          rows={4}
          defaultValue={initial.bio}
          maxLength={2000}
          placeholder="Share a bit about yourself — your goals, grade, or what you're preparing for."
        />
        {errs?.bio ? <FieldError>{errs.bio}</FieldError> : null}
      </Field>
      {result && !result.ok && !result.fieldErrors ? (
        <ErrorText>{result.error}</ErrorText>
      ) : null}
      <div>
        <Button type="submit" isLoading={isPending}>
          Save about you
        </Button>
      </div>
    </Form>
  );
}
