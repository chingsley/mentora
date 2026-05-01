"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string; }>;
  placeholder?: string;
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${COLORS.HEADER};
`;

const StyledSelect = styled.select<{ $hasError: boolean; $isPlaceholder: boolean; }>`
  height: ${FORM_FIELD.CONTROL_MIN_HEIGHT};
  width: 100%;
  padding: 0 ${FORM_FIELD.CONTROL_PADDING_INLINE};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: 1.4;
  color: ${(p) => (p.$isPlaceholder ? COLORS.MUTED_FOREGROUND : COLORS.TEXT)};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${(p) => formFieldControlBorder(p.$hasError)};
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
  const isControlled = rest.value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(() => {
    if (typeof rest.defaultValue === "string") return rest.defaultValue;
    if (Array.isArray(rest.defaultValue)) return rest.defaultValue[0] ?? "";
    return "";
  });
  const currentValue = isControlled ? String(rest.value ?? "") : uncontrolledValue;
  const isPlaceholder = !!placeholder && currentValue === "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!isControlled) setUncontrolledValue(e.currentTarget.value);
    rest.onChange?.(e);
  }

  return (
    <Field>
      {label ? <Label htmlFor={selectId}>{label}</Label> : null}
      <StyledSelect
        id={selectId}
        ref={ref}
        $hasError={!!error}
        $isPlaceholder={isPlaceholder}
        aria-invalid={error ? true : undefined}
        {...rest}
        onChange={handleChange}
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
