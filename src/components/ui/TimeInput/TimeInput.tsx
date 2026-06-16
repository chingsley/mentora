"use client";

import * as React from "react";
import styled from "styled-components";
import {
  FormFieldControlSlot,
  FormFieldError,
  FormFieldHint,
  FormFieldLabel,
  FormFieldLabelSlot,
  FormFieldMetaSlot,
  FormFieldRoot,
} from "@/components/ui/FormField";
import { COLORS } from "@/constants/colors.constants";
import {
  APP_INPUT_HEIGHT,
  FORM_FIELD,
  formFieldControlBorder,
  formFieldSelectChevronStyles,
} from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { Meridiem } from "@/lib/timeInput";
import {
  normalizeTime12Text,
  sanitizeTime12Input,
  time12PartsTo24,
  time24To12Parts,
} from "@/lib/timeInput";

export interface TimeInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  id?: string;
  placeholder?: string;
}

const Field = FormFieldRoot;

const ControlRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${SPACING.TWO};
  width: fit-content;
  max-width: 100%;
`;

const TimeTextInput = styled.input<{ $hasError: boolean }>`
  flex: 0 0 auto;
  width: ${FORM_FIELD.CONTROL_TIME_TEXT_WIDTH};
  min-width: 0;
  height: ${APP_INPUT_HEIGHT};
  padding: 0 ${FORM_FIELD.CONTROL_PADDING_INLINE};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.TEXT};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${(p) => formFieldControlBorder(p.$hasError)};
  box-shadow: ${BOX_SHADOW_INPUTS};
  outline: none;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${FORM_FIELD.PLACEHOLDER_COLOR};
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
    cursor: not-allowed;
  }
`;

const MeridiemSelect = styled.select<{ $hasError: boolean }>`
  flex: 0 0 auto;
  width: ${FORM_FIELD.CONTROL_MERIDIEM_WIDTH};
  height: ${APP_INPUT_HEIGHT};
  padding-left: ${FORM_FIELD.CONTROL_PADDING_INLINE};
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.TEXT};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${(p) => formFieldControlBorder(p.$hasError)};
  box-shadow: ${BOX_SHADOW_INPUTS};
  outline: none;
  transition: border-color 0.15s ease;
  ${formFieldSelectChevronStyles()};

  &:hover:not(:disabled) {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.PRIMARY)};
  }

  &:focus {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.SIDEBAR_BRAND)};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HintText = FormFieldHint;

const ErrorText = FormFieldError;

const MERIDIEM_OPTIONS: ReadonlyArray<{ value: Meridiem; label: string }> = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
];

export function TimeInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  hint,
  id,
  placeholder = "9:00",
}: TimeInputProps) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;
  const timeInputId = `${fieldId}-time`;
  const meridiemId = `${fieldId}-meridiem`;

  const [focused, setFocused] = React.useState(false);
  const initialParts = React.useMemo(() => time24To12Parts(value), [value]);
  const [timeText, setTimeText] = React.useState(initialParts.timeText);
  const [meridiem, setMeridiem] = React.useState<Meridiem>(initialParts.meridiem);

  React.useEffect(() => {
    if (focused) return;
    const parts = time24To12Parts(value);
    setTimeText(parts.timeText);
    setMeridiem(parts.meridiem);
  }, [value, focused]);

  function commit(timeTextValue: string, meridiemValue: Meridiem) {
    const converted = time12PartsTo24(timeTextValue, meridiemValue);
    if (converted) onChange(converted);
  }

  function handleTimeTextChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextText = sanitizeTime12Input(event.target.value);
    setTimeText(nextText);
    commit(nextText, meridiem);
  }

  function handleTimeTextBlur() {
    setFocused(false);
    const normalized = normalizeTime12Text(timeText);
    setTimeText(normalized);
    commit(normalized, meridiem);
  }

  function handleMeridiemChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextMeridiem = event.target.value as Meridiem;
    setMeridiem(nextMeridiem);
    commit(timeText, nextMeridiem);
  }

  return (
    <Field $hasLabel={Boolean(label)}>
      {label ? (
        <FormFieldLabelSlot>
          <FormFieldLabel htmlFor={timeInputId}>
            {label}
            {required ? " *" : null}
          </FormFieldLabel>
        </FormFieldLabelSlot>
      ) : null}
      <FormFieldControlSlot>
        <ControlRow>
          <TimeTextInput
          id={timeInputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          value={timeText}
          disabled={disabled}
          required={required}
          $hasError={Boolean(error)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={handleTimeTextBlur}
          onChange={handleTimeTextChange}
        />
        <MeridiemSelect
          id={meridiemId}
          value={meridiem}
          disabled={disabled}
          required={required}
          $hasError={Boolean(error)}
          aria-label={`${label ?? "Time"} AM or PM`}
          onChange={handleMeridiemChange}
        >
          {MERIDIEM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </MeridiemSelect>
        </ControlRow>
      </FormFieldControlSlot>
      <FormFieldMetaSlot>
        {hint && !error ? <HintText id={`${fieldId}-hint`}>{hint}</HintText> : null}
        {error ? <ErrorText id={`${fieldId}-error`}>{error}</ErrorText> : null}
      </FormFieldMetaSlot>
    </Field>
  );
}
