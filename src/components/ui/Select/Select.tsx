"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
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

const StyledSelect = styled.select<{ $hasError: boolean }>`
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

  &:hover:not(:disabled) {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.PRIMARY)};
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
`;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, id, ...rest },
  ref,
) {
  const autoId = React.useId();
  const selectId = id ?? autoId;
  return (
    <Field>
      {label ? <Label htmlFor={selectId}>{label}</Label> : null}
      <StyledSelect
        id={selectId}
        ref={ref}
        $hasError={!!error}
        aria-invalid={error ? true : undefined}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </StyledSelect>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </Field>
  );
});
