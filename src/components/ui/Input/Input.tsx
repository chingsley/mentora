"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { APP_INPUT_HEIGHT, FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS } from "@/constants/layout.constants";
import {
  FormFieldControlSlot,
  FormFieldError,
  FormFieldHint,
  FormFieldLabel,
  FormFieldLabelNote,
  FormFieldLabelSlot,
  FormFieldMetaSlot,
  FormFieldRoot,
} from "@/components/ui/FormField";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Muted note beside the label (same color as `hint`). */
  labelNote?: string;
  error?: string;
  hint?: string;
}

const StyledInput = styled.input<{ $hasError: boolean }>`
  height: ${APP_INPUT_HEIGHT};
  width: 100%;
  padding: 0 ${FORM_FIELD.CONTROL_PADDING_INLINE};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: 1.4;
  color: ${COLORS.TEXT};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${(p) => formFieldControlBorder(p.$hasError)};
  box-shadow: ${BOX_SHADOW_INPUTS};
  outline: none;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${FORM_FIELD.PLACEHOLDER_COLOR};
    font-weight: ${FONTS.WEIGHT.NORMAL};
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px ${FORM_FIELD.CONTROL_BACKGROUND} inset;
    box-shadow: 0 0 0 1000px ${FORM_FIELD.CONTROL_BACKGROUND} inset;
    -webkit-text-fill-color: ${COLORS.TEXT};
  }

  &:hover:not(:disabled) {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.PRIMARY)};
  }

  &:focus {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.SIDEBAR_BRAND)};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }

  &:disabled {
    opacity: 0.6;
  }
`;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, labelNote, error, hint, id, ...rest },
  ref,
) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const hasLabel = Boolean(label);

  return (
    <FormFieldRoot $hasLabel={hasLabel}>
      {hasLabel ? (
        <FormFieldLabelSlot>
          <FormFieldLabel htmlFor={inputId}>
            {label}
            {labelNote ? <FormFieldLabelNote>{labelNote}</FormFieldLabelNote> : null}
          </FormFieldLabel>
        </FormFieldLabelSlot>
      ) : null}
      <FormFieldControlSlot>
        <StyledInput
          id={inputId}
          ref={ref}
          $hasError={!!error}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />
      </FormFieldControlSlot>
      <FormFieldMetaSlot>
        {hint && !error ? <FormFieldHint id={`${inputId}-hint`}>{hint}</FormFieldHint> : null}
        {error ? <FormFieldError id={`${inputId}-error`}>{error}</FormFieldError> : null}
      </FormFieldMetaSlot>
    </FormFieldRoot>
  );
});
