"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.HALF};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const StyledInput = styled.input<{ $hasError: boolean }>`
  height: 2.5rem;
  width: 100%;
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  color: ${COLORS.TEXT};
  background-color: ${COLORS.FOREGROUND};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.BORDER)};
  outline: none;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${COLORS.MUTED_FOREGROUND};
  }

  &:hover:not(:disabled) {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.PRIMARY)};
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const HintText = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
`;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, ...rest },
  ref,
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  return (
    <Field>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <StyledInput
        id={inputId}
        ref={ref}
        $hasError={!!error}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...rest}
      />
      {hint && !error ? <HintText id={`${inputId}-hint`}>{hint}</HintText> : null}
      {error ? <ErrorText id={`${inputId}-error`}>{error}</ErrorText> : null}
    </Field>
  );
});
