"use client";

import Link from "next/link";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { FONTS } from "@/constants/fonts.constants";

export const AUTH_THEME = {
  text: "#0a2540",
  textMuted: "#3d4d5f",
  textSoft: "#475569",
  border: "hsl(214.3 31.8% 91.4%)",
  inputBorder: "rgba(10, 37, 64, 0.9)",
  surface: "#ffffff",
  cta: "#3f4654",
  ctaHover: "#323945",
  linkHover: "#1d4ed8",
  formError: "#c85848",
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
  margin: 0 0 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: ${FONTS.SIZE.MD};
  line-height: 1.45;
  border: 1px solid ${AUTH_THEME.border};
  background: ${AUTH_THEME.surface};
  color: ${AUTH_THEME.text};

  ${(p) =>
    p.$visible
      ? `
    border-color: #d14343;
    color: #5e0b0b;
    background: #fff4f4;
  `
      : `
    display: none;
  `}
`;

export const AuthFieldGrid = styled.div`
  display: grid;
  column-gap: 16px;

  @media (min-width: 560px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FieldRow = styled.div`
  margin-bottom: 22px;
`;

const FloatField = styled.div<{ $floating?: boolean; }>`
  position: relative;
  padding-top: 2px;

  & > input,
  & > select {
    display: block;
    width: 100%;
    margin: 0;
    padding: 28px 0 8px;
    border: none;
    border-bottom: 1px solid ${AUTH_THEME.inputBorder};
    border-radius: 0;
    background-color: transparent;
    box-shadow: none;
    font-family: ${FONTS.FAMILY.PRIMARY};
    font-size: ${FONTS.SIZE.BASE};
    color: ${AUTH_THEME.text};
    outline: none;
    /* Border width and padding stay fixed; only color changes so the line does not jump. */
    transition: border-color 0.2s ${FLOAT_EASE};
  }

  & > input::placeholder {
    color: transparent;
    opacity: 1;
  }

  & > select {
    padding-right: 22px;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%230a2540' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0 bottom 10px;
    background-size: 12px 12px;
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
      top: 2px;
      bottom: auto;
      transform: scale(0.8125);
      transform-origin: left top;
      font-weight: ${FONTS.WEIGHT.SEMIBOLD};
    }
  `}

  & > input:focus,
  & > select:focus {
    outline: none;
  }

  & > input:focus:not([aria-invalid="true"]),
  & > select:focus:not([aria-invalid="true"]) {
    border-bottom-color: ${AUTH_THEME.text};
  }

  & > input[aria-invalid="true"],
  & > select[aria-invalid="true"] {
    border-bottom-color: ${AUTH_THEME.formError};
  }

  & > input:-webkit-autofill,
  & > input:-webkit-autofill:hover,
  & > input:-webkit-autofill:focus,
  & > input:-webkit-autofill:active {
    border-bottom-color: ${AUTH_THEME.inputBorder};
    -webkit-text-fill-color: ${AUTH_THEME.text};
    transition: background-color 9999s ease-out;
  }

  & > label {
    position: absolute;
    left: 0;
    top: auto;
    bottom: 10px;
    margin: 0;
    font-size: ${FONTS.SIZE.BASE};
    font-weight: ${FONTS.WEIGHT.MEDIUM};
    color: ${AUTH_THEME.textSoft};
    line-height: 1.35;
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
    top: 2px;
    bottom: auto;
    transform: scale(0.8125);
    transform-origin: left top;
    font-weight: ${FONTS.WEIGHT.SEMIBOLD};
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
    font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  }

  & > input:-webkit-autofill + label {
    top: 2px;
    bottom: auto;
    transform: scale(0.8125);
    transform-origin: left top;
    font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  }

  @media (prefers-reduced-motion: reduce) {
    & > input,
    & > select,
    & > label {
      transition: none;
    }
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
  margin: 0 0 22px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(29, 78, 216, 0.08); /* Use this color for a light mauve color */
  border: 1px solid rgba(29, 78, 216, 0.12);
  font-size: ${FONTS.SIZE.SM};
  line-height: 1.45;
  color: ${AUTH_THEME.text};
`;

export const AuthCheckRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin: -8px 0 14px;
  font-size: ${FONTS.SIZE["2XS"]};
  line-height: 1.35;
  color: ${AUTH_THEME.textMuted};
  cursor: pointer;
  user-select: none;
  text-align: left;

  input {
    width: 18px;
    height: 18px;
    margin: 0;
    flex-shrink: 0;
    accent-color: ${AUTH_THEME.cta};
    cursor: pointer;
  }
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
  margin-top: 28px;
`;

export const AuthSubmitButton = styled(Button)`
  width: 100%;
  height: auto;
  padding: 12px 18px;
  border-radius: 8px;
  background-color: ${AUTH_THEME.cta};
  font-size: ${FONTS.SIZE.MD};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: #ffffff;
  transition:
    background 0.2s ease,
    box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${AUTH_THEME.ctaHover};
    box-shadow: 0 10px 28px rgba(88, 95, 113, 0.28);
    // transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    box-shadow: 0 4px 14px rgba(88, 95, 113, 0.2);
    transform: translateY(0);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover:not(:disabled),
    &:active:not(:disabled) {
      transform: none;
    }
  }
`;

export const AuthFoot = styled.p`
  margin: 24px 0 0;
  padding-top: 20px;
  border-top: 1px solid ${AUTH_THEME.border};
  font-size: ${FONTS.SIZE.SM};
  line-height: 1.5;
  color: ${AUTH_THEME.textMuted};
  text-align: left;
`;

export const AuthLink = styled(Link)`
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${AUTH_THEME.cta};
  text-decoration: none;

  &:hover,
  &:focus-visible {
    color: ${AUTH_THEME.ctaHover};
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid ${AUTH_THEME.cta};
    outline-offset: 2px;
    border-radius: 6px;
  }
`;

export type AuthRegisterRole = "STUDENT" | "TEACHER" | "GUARDIAN";

const RoleRadioGroupShell = styled.div`
  margin-bottom: 22px;
`;

const RoleLegend = styled.p`
  margin: 0 0 8px;
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  font-size: ${FONTS.SIZE.BASE};
  color: ${AUTH_THEME.text};
  line-height: 1.35;
`;

const RoleRadioOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 560px) {
    flex-flow: row wrap;
    column-gap: 24px;
    row-gap: 10px;
  }
`;

const RoleRadioLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: ${FONTS.SIZE.SM};
  line-height: 1.45;
  color: ${AUTH_THEME.text};
  user-select: none;
`;

/** Matches Maje teacher-dashboard radios: 24×24px, theme accent, native appearance. */
const RoleRadioInput = styled.input.attrs({ type: "radio" })`
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  min-width: 1.5rem;
  min-height: 1.5rem;
  margin: 0;
  accent-color: ${AUTH_THEME.cta};
  cursor: pointer;
  appearance: auto;
  -webkit-appearance: auto;
`;

const ROLE_RADIO_OPTIONS: { value: AuthRegisterRole; label: string; }[] = [
  { value: "STUDENT", label: "Student" },
  { value: "TEACHER", label: "Teacher" },
  { value: "GUARDIAN", label: "Guardian" },
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
        role="radiogroup"
        aria-labelledby={legendId}
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
