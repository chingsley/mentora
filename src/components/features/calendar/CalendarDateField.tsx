"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { APP_INPUT_HEIGHT, FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { CalendarRangePicker } from "./CalendarRangePicker";

export interface CalendarDateFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  /** Overrides visible label for screen readers when `label` is omitted. */
  "aria-label"?: string;
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const TriggerWrap = styled.div`
  position: relative;
  width: 100%;
`;

const Trigger = styled.button<{ $hasError: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.TWO};
  width: 100%;
  height: ${APP_INPUT_HEIGHT};
  padding: 0 ${FORM_FIELD.CONTROL_PADDING_INLINE};
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${(p) => formFieldControlBorder(p.$hasError)};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
  box-shadow: ${BOX_SHADOW_INPUTS};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.TEXT};
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.PRIMARY)};
  }

  &:focus-visible {
    border-color: ${(p) => (p.$hasError ? COLORS.DESTRUCTIVE : COLORS.SIDEBAR_BRAND)};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TriggerText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
`;

const TriggerIcons = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: ${SPACING.ONE};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Hint = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

function parseIsoDate(value: string): Date {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string): string {
  if (!value) return "Select date";
  const date = parseIsoDate(value);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CalendarDateField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  hint,
  "aria-label": ariaLabel,
}: CalendarDateFieldProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const anchor = parseIsoDate(value);
  const fieldId = React.useId();
  const labelText = label ?? ariaLabel ?? "Date";

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <Field ref={rootRef}>
      {label ? (
        <Label htmlFor={fieldId}>
          {label}
          {required ? " *" : null}
        </Label>
      ) : null}
      <TriggerWrap>
        <Trigger
          id={fieldId}
          type="button"
          $hasError={Boolean(error)}
          disabled={disabled}
          aria-label={label ? undefined : ariaLabel ?? labelText}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          onClick={() => setOpen((current) => !current)}
        >
          <TriggerText>{formatDisplayDate(value)}</TriggerText>
          <TriggerIcons aria-hidden>
            <CalendarDays size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.NORMAL} />
            <ChevronDown size={ICON_SIZE.XS} strokeWidth={ICON_STROKE.NORMAL} />
          </TriggerIcons>
        </Trigger>
        {open ? (
          <CalendarRangePicker
            view="day"
            anchor={anchor}
            onSelect={(date) => {
              onChange(toIsoDate(date));
              setOpen(false);
            }}
          />
        ) : null}
      </TriggerWrap>
      {hint && !error ? <Hint id={`${fieldId}-hint`}>{hint}</Hint> : null}
      {error ? <ErrorText id={`${fieldId}-error`}>{error}</ErrorText> : null}
    </Field>
  );
}
