"use client";

import * as React from "react";
import styled from "styled-components";
import {
  FormFieldControlSlot,
  FormFieldError,
  FormFieldLabel,
  FormFieldLabelSlot,
  FormFieldMetaSlot,
  FormFieldRoot,
} from "@/components/ui/FormField";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD, formFieldControlBorder, formFieldSelectChevronStyles } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const StyledSelect = styled.select<{ $hasError: boolean; $isPlaceholder: boolean }>`
  height: ${FORM_FIELD.CONTROL_MIN_HEIGHT};
  width: 100%;
  padding: 0 ${FORM_FIELD.CONTROL_PADDING_INLINE};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: 1.4;
  color: ${(p) => (p.$isPlaceholder ? FORM_FIELD.PLACEHOLDER_COLOR : COLORS.TEXT)};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${(p) => formFieldControlBorder(p.$hasError)};
  outline: none;
  transition: border-color 0.15s ease;
  ${formFieldSelectChevronStyles()};

  &:hover:not(:disabled) {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.PRIMARY)};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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
  const hasLabel = Boolean(label);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!isControlled) setUncontrolledValue(e.currentTarget.value);
    rest.onChange?.(e);
  }

  return (
    <FormFieldRoot $hasLabel={hasLabel}>
      {hasLabel ? (
        <FormFieldLabelSlot>
          <FormFieldLabel htmlFor={selectId}>{label}</FormFieldLabel>
        </FormFieldLabelSlot>
      ) : null}
      <FormFieldControlSlot>
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
      </FormFieldControlSlot>
      <FormFieldMetaSlot>
        {error ? <FormFieldError>{error}</FormFieldError> : null}
      </FormFieldMetaSlot>
    </FormFieldRoot>
  );
});
