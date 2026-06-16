"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { FORM_FIELD, formFieldControlBorder, formFieldSelectChevronStyles } from "@/constants/formField.constants";
import { ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { SPACING } from "@/constants/spacing.constants";

export const AUTH_THEME = {
  text: COLORS.MARKETING_TEXT_PRIMARY,
  textMuted: COLORS.MARKETING_TEXT_SECONDARY,
  textSoft: COLORS.MARKETING_TEXT_TERTIARY,
  border: COLORS.MARKETING_BORDER,
  inputBorder: COLORS.MARKETING_BORDER,
  inputBorderFocus: COLORS.ACTION_PRIMARY,
  surface: COLORS.FOREGROUND,
  cta: COLORS.ACTION_PRIMARY,
  ctaHover: COLORS.ACTION_PRIMARY_HOVER,
  linkHover: COLORS.ACTION_PRIMARY_HOVER,
  formError: COLORS.DESTRUCTIVE,
  calloutBg: COLORS.ACTION_PRIMARY_TINT_10,
  calloutBorder: COLORS.ACTION_PRIMARY_BORDER_22,
};

const FLOAT_EASE = "cubic-bezier(0.22, 1, 0.32, 1)";
const FLOAT_MOVE = `0.38s ${FLOAT_EASE}`;

function joinIds(...ids: Array<string | undefined>) {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

export const AuthForm = styled.form`
  display: block;
  width: 100%;
`;

export const AuthFeedbackBanner = styled.p<{ $visible: boolean; }>`
  margin: 0 0 ${SPACING.FOUR};
  padding: ${SPACING.THREE} ${SPACING.FOUR};
  border-radius: ${MARKETING.CTA_RADIUS};
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  border: 1px solid ${AUTH_THEME.border};
  background: ${AUTH_THEME.surface};
  color: ${AUTH_THEME.text};

  ${(p) =>
    p.$visible
      ? `
    border-color: ${COLORS.DESTRUCTIVE_BORDER_HOVER};
    color: ${COLORS.DESTRUCTIVE};
    background: ${COLORS.DESTRUCTIVE_BG_HOVER};
  `
      : `
    display: none;
  `}
`;

export const AuthFieldGrid = styled.div`
  display: flex;
  flex-direction: column;
`;

const FieldRow = styled.div`
  margin-bottom: ${SPACING.FIVE};
`;

const FloatField = styled.div<{ $floating?: boolean; $hasToggle?: boolean; }>`
  position: relative;
  padding-top: ${SPACING.HALF};

  & > input,
  & > select {
    display: block;
    width: 100%;
    margin: 0;
    padding: ${SPACING.SIX} ${FORM_FIELD.CONTROL_PADDING_INLINE} ${SPACING.TWO};
    border: ${formFieldControlBorder(false)};
    border-radius: ${MARKETING.CTA_RADIUS};
    background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
    box-shadow: none;
    font-family: ${FONTS.FAMILY.PRIMARY};
    font-size: ${FONTS.SIZE.SM};
    color: ${AUTH_THEME.text};
    outline: none;
    transition: border-color 0.2s ${FLOAT_EASE};
  }

  ${(p) =>
    p.$hasToggle
      ? `
    & > input {
      padding-right: calc(${FORM_FIELD.CONTROL_PADDING_INLINE} + ${SPACING.SIX});
    }
  `
      : ""}

  & > input::placeholder {
    color: transparent;
    opacity: 1;
  }

  & > select {
    ${formFieldSelectChevronStyles(AUTH_THEME.text)};
  }

  ${(p) =>
    !p.$floating
      ? `
    & > select {
      color: transparent;
    }
  `
      : `
    & > select + label {
      top: ${SPACING.TWO};
      bottom: auto;
      transform: scale(0.875);
      transform-origin: left top;
      font-weight: ${FONTS.WEIGHT.MEDIUM};
    }
  `}

  & > input:focus,
  & > select:focus {
    outline: none;
  }

  & > input:focus:not([aria-invalid="true"]),
  & > select:focus:not([aria-invalid="true"]) {
    border-color: ${AUTH_THEME.inputBorderFocus};
  }

  & > input[aria-invalid="true"],
  & > select[aria-invalid="true"] {
    border-color: ${AUTH_THEME.formError};
  }

  & > input:-webkit-autofill,
  & > input:-webkit-autofill:hover,
  & > input:-webkit-autofill:focus,
  & > input:-webkit-autofill:active {
    border-color: ${AUTH_THEME.inputBorder};
    -webkit-text-fill-color: ${AUTH_THEME.text};
    transition: background-color 9999s ease-out;
  }

  & > label {
    position: absolute;
    left: ${FORM_FIELD.CONTROL_PADDING_INLINE};
    top: auto;
    bottom: ${SPACING.THREE};
    margin: 0;
    font-size: ${FONTS.SIZE.SM};
    font-weight: ${FONTS.WEIGHT.MEDIUM};
    color: ${AUTH_THEME.textSoft};
    line-height: ${FONTS.LINE_HEIGHT.SNUG};
    pointer-events: none;
    transform: none;
    transform-origin: left bottom;
    transition:
      transform ${FLOAT_MOVE},
      top ${FLOAT_MOVE},
      bottom ${FLOAT_MOVE},
      color 0.32s ${FLOAT_EASE};
  }

  &:focus-within > label,
  & > input:not(:placeholder-shown) + label {
    top: ${SPACING.TWO};
    bottom: auto;
    transform: scale(0.875);
    transform-origin: left top;
    font-weight: ${FONTS.WEIGHT.MEDIUM};
  }

  &:focus-within > input:not([aria-invalid="true"]) + label,
  &:focus-within > select:not([aria-invalid="true"]) + label {
    color: ${AUTH_THEME.linkHover};
  }

  & > input:not(:placeholder-shown):not(:focus) + label {
    color: ${AUTH_THEME.textSoft};
  }

  & > input[aria-invalid="true"] + label,
  & > select[aria-invalid="true"] + label {
    color: ${AUTH_THEME.formError};
    font-weight: ${FONTS.WEIGHT.MEDIUM};
  }

  & > input:-webkit-autofill + label {
    top: ${SPACING.TWO};
    bottom: auto;
    transform: scale(0.875);
    transform-origin: left top;
    font-weight: ${FONTS.WEIGHT.MEDIUM};
  }

  & > input[data-concealed="true"] {
    -webkit-text-security: disc;
  }

  @media (prefers-reduced-motion: reduce) {
    & > input,
    & > select,
    & > label {
      transition: none;
    }
  }
`;

const PasswordVisibilityButton = styled.button`
  position: absolute;
  right: ${SPACING.THREE};
  top: 50%;
  transform: translateY(-42%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${SPACING.SIX};
  height: ${SPACING.SIX};
  padding: 0;
  border: none;
  border-radius: ${MARKETING.CTA_RADIUS};
  background: ${COLORS.TRANSPARENT};
  color: ${AUTH_THEME.textSoft};
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: ${AUTH_THEME.text};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
  }
`;

const FieldMessage = styled.p<{ $tone?: "error" | "hint"; }>`
  margin: 6px 0 0;
  font-size: ${FONTS.SIZE["2XS"]};
  color: ${(p) =>
    p.$tone === "hint" ? AUTH_THEME.textSoft : AUTH_THEME.formError};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  line-height: 1.35;
`;

export const AuthHint = styled.p`
  margin: -8px 0 22px;
  font-size: ${FONTS.SIZE["2XS"]};
  line-height: 1.45;
  color: ${AUTH_THEME.textMuted};
`;

export const AuthCallout = styled.p`
  margin: 0 0 ${SPACING.FIVE};
  padding: ${SPACING.THREE} ${SPACING.FOUR};
  border-radius: ${MARKETING.CTA_RADIUS};
  background: ${AUTH_THEME.calloutBg};
  border: 1px solid ${AUTH_THEME.calloutBorder};
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${AUTH_THEME.text};
`;

export const AuthAuxiliaryRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
`;

export const AuthFormActions = styled.div`
  margin-top: ${SPACING.SIX};
`;

export const AuthSubmitButton = styled(Button)`
  width: 100%;
  height: auto;
  min-height: ${FORM_FIELD.CONTROL_MIN_HEIGHT};
  padding: ${SPACING.THREE} ${SPACING.FIVE};
  border-radius: ${MARKETING.CTA_RADIUS};
  background-color: ${AUTH_THEME.cta};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.WHITE};
  transition:
    background-color 0.15s ease,
    opacity 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${AUTH_THEME.ctaHover};
  }

  &:disabled {
    opacity: 0.55;
  }
`;

export const AuthFoot = styled.p`
  margin: ${SPACING.SIX} 0 0;
  padding-top: ${SPACING.FIVE};
  border-top: 1px solid ${AUTH_THEME.border};
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${AUTH_THEME.textMuted};
  text-align: center;
`;

export const AuthLink = styled(Link)`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${AUTH_THEME.cta};
  text-decoration: none;

  &:hover,
  &:focus-visible {
    color: ${AUTH_THEME.linkHover};
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
    border-radius: ${MARKETING.CTA_RADIUS};
  }
`;

export type AuthRegisterRole = "STUDENT" | "TEACHER";

const RoleRadioGroupShell = styled.fieldset`
  margin: 0 0 ${SPACING.FIVE};
  padding: 0;
  border: none;
`;

const RoleLegend = styled.legend`
  display: block;
  margin-bottom: ${SPACING.THREE};
  padding: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${AUTH_THEME.textMuted};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const RoleRadioOptions = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${SPACING.TWO};
`;

const RoleRadioLabel = styled.label`
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.TWO};
  min-height: ${FORM_FIELD.CONTROL_MIN_HEIGHT};
  padding: 0 ${SPACING.TWO};
  border: ${formFieldControlBorder(false)};
  border-radius: ${MARKETING.CTA_RADIUS};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
  cursor: pointer;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${AUTH_THEME.text};
  user-select: none;
  text-align: center;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;

  &:has(input:checked) {
    border-color: ${AUTH_THEME.inputBorderFocus};
    background-color: ${AUTH_THEME.calloutBg};
    font-weight: ${FONTS.WEIGHT.MEDIUM};
  }

  &:hover {
    border-color: ${AUTH_THEME.inputBorderFocus};
  }
`;

const RoleRadioInput = styled.input.attrs({ type: "radio" })`
  flex-shrink: 0;
  width: ${SPACING.FOUR};
  height: ${SPACING.FOUR};
  min-width: ${SPACING.FOUR};
  min-height: ${SPACING.FOUR};
  margin: 0;
  accent-color: ${AUTH_THEME.cta};
  cursor: pointer;
`;

const ROLE_RADIO_OPTIONS: { value: AuthRegisterRole; label: string; }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "TEACHER", label: "Teacher" },
];

export interface AuthRoleRadioGroupProps {
  legend: string;
  name?: string;
  value: AuthRegisterRole;
  onChange: (role: AuthRegisterRole) => void;
  error?: string;
}

export function AuthRoleRadioGroup({
  legend,
  name = "role",
  value,
  onChange,
  error,
}: AuthRoleRadioGroupProps) {
  const legendId = React.useId();
  const errorId = `${legendId}-error`;

  return (
    <RoleRadioGroupShell>
      <RoleLegend id={legendId}>{legend}</RoleLegend>
      <RoleRadioOptions
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? errorId : undefined}
      >
        {ROLE_RADIO_OPTIONS.map((opt, index) => (
          <RoleRadioLabel key={opt.value}>
            <RoleRadioInput
              name={name}
              value={opt.value}
              checked={value === opt.value}
              required={index === 0}
              onChange={() => {
                onChange(opt.value);
              }}
            />
            {opt.label}
          </RoleRadioLabel>
        ))}
      </RoleRadioOptions>
      {error ? (
        <FieldMessage id={errorId} $tone="error">
          {error}
        </FieldMessage>
      ) : null}
    </RoleRadioGroupShell>
  );
}

type AuthTextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function AuthTextField({
  id,
  label,
  error,
  hint,
  placeholder,
  "aria-describedby": ariaDescribedBy,
  ...inputProps
}: AuthTextFieldProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <FieldRow>
      <FloatField>
        <input
          {...inputProps}
          id={inputId}
          placeholder={placeholder ?? "\u00a0"}
          aria-invalid={error ? true : inputProps["aria-invalid"]}
          aria-describedby={joinIds(ariaDescribedBy, messageId)}
        />
        <label htmlFor={inputId}>{label}</label>
      </FloatField>
      {hint && !error ? (
        <FieldMessage id={`${inputId}-hint`} $tone="hint">
          {hint}
        </FieldMessage>
      ) : null}
      {error ? (
        <FieldMessage id={`${inputId}-error`} $tone="error">
          {error}
        </FieldMessage>
      ) : null}
    </FieldRow>
  );
}

function useCssTextSecurityMask(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => {
      if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
        return false;
      }
      return (
        CSS.supports("-webkit-text-security", "disc") ||
        CSS.supports("text-security", "disc")
      );
    },
    () => false,
  );
}

export type AuthPasswordFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "defaultValue"
> & {
  label: string;
  error?: string;
  hint?: string;
};

/** Password field with an inline show/hide toggle (eye icon). */
export function AuthPasswordField({
  id,
  label,
  error,
  hint,
  placeholder,
  value,
  onChange,
  "aria-describedby": ariaDescribedBy,
  ...inputProps
}: AuthPasswordFieldProps) {
  const canMaskWithCss = useCssTextSecurityMask();
  const [visible, setVisible] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState("");
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  const isControlled = value !== undefined;
  const currentValue = isControlled ? String(value) : internalValue;
  const concealWithCss = canMaskWithCss && !visible;
  const inputType = canMaskWithCss || visible ? "text" : "password";
  const toggleLabel = visible ? "Hide password" : "Show password";

  return (
    <FieldRow>
      <FloatField $hasToggle>
        <input
          {...inputProps}
          id={inputId}
          type={inputType}
          value={currentValue}
          placeholder={placeholder ?? "\u00a0"}
          aria-invalid={error ? true : inputProps["aria-invalid"]}
          aria-describedby={joinIds(ariaDescribedBy, messageId)}
          data-concealed={concealWithCss ? "true" : undefined}
          onChange={(event) => {
            if (!isControlled) {
              setInternalValue(event.target.value);
            }
            onChange?.(event);
          }}
        />
        <label htmlFor={inputId}>{label}</label>
        <PasswordVisibilityButton
          type="button"
          aria-label={toggleLabel}
          aria-pressed={visible}
          onClick={() => {
            setVisible((current) => !current);
          }}
        >
          {visible ? (
            <EyeOff
              size={ICON_SIZE.MD}
              strokeWidth={ICON_STROKE.MEDIUM}
              color={ICON_THEME.INLINE_MUTED}
              aria-hidden
            />
          ) : (
            <Eye
              size={ICON_SIZE.MD}
              strokeWidth={ICON_STROKE.MEDIUM}
              color={ICON_THEME.INLINE_MUTED}
              aria-hidden
            />
          )}
        </PasswordVisibilityButton>
      </FloatField>
      {hint && !error ? (
        <FieldMessage id={`${inputId}-hint`} $tone="hint">
          {hint}
        </FieldMessage>
      ) : null}
      {error ? (
        <FieldMessage id={`${inputId}-error`} $tone="error">
          {error}
        </FieldMessage>
      ) : null}
    </FieldRow>
  );
}

export type AuthSelectOption = {
  value: string;
  label: string;
};

type AuthSelectFieldProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  label: string;
  error?: string;
  options: AuthSelectOption[];
  placeholder?: string;
};

export function AuthSelectField({
  id,
  label,
  error,
  options,
  placeholder,
  value,
  defaultValue,
  onBlur,
  onChange,
  onFocus,
  "aria-describedby": ariaDescribedBy,
  ...selectProps
}: AuthSelectFieldProps) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const [isFocused, setIsFocused] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(() =>
    typeof value === "string"
      ? value
      : typeof defaultValue === "string"
        ? defaultValue
        : "",
  );
  const currentValue = typeof value === "string" ? value : internalValue;
  const messageId = error ? `${selectId}-error` : undefined;

  return (
    <FieldRow>
      <FloatField $floating={isFocused || currentValue !== ""}>
        <select
          {...selectProps}
          id={selectId}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          aria-invalid={error ? true : selectProps["aria-invalid"]}
          aria-describedby={joinIds(ariaDescribedBy, messageId)}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onChange={(event) => {
            if (value === undefined) {
              setInternalValue(event.target.value);
            }
            onChange?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor={selectId}>{label}</label>
      </FloatField>
      {error ? (
        <FieldMessage id={`${selectId}-error`} $tone="error">
          {error}
        </FieldMessage>
      ) : null}
    </FieldRow>
  );
}
