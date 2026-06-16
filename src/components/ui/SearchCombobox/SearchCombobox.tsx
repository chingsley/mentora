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
import { APP_INPUT_HEIGHT, FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface SearchComboboxOption {
  value: string;
  label: string;
}

export interface SearchComboboxProps {
  label: string;
  value: SearchComboboxOption | null;
  onChange: (option: SearchComboboxOption | null) => void;
  options: SearchComboboxOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  /** Keep typed text when no list option matches (e.g. city not in catalog). */
  allowCustomValue?: boolean;
  emptyMessage?: string;
  maxSuggestions?: number;
  id?: string;
}

const InputWrap = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input<{ $hasError: boolean }>`
  height: ${APP_INPUT_HEIGHT};
  width: 100%;
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
    font-weight: ${FONTS.WEIGHT.NORMAL};
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

const Listbox = styled.ul`
  position: absolute;
  z-index: ${LAYOUT.Z.STICKY};
  top: calc(100% + ${SPACING.ONE});
  left: 0;
  right: 0;
  margin: 0;
  padding: ${SPACING.ONE};
  list-style: none;
  max-height: 12rem;
  overflow-y: auto;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${formFieldControlBorder(false)};
  box-shadow: ${BOX_SHADOW_INPUTS};
  background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
`;

const OptionBtn = styled.button<{ $active: boolean }>`
  display: block;
  width: 100%;
  border: none;
  border-radius: ${LAYOUT.RADIUS.SM};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  text-align: left;
  font-size: ${FONTS.SIZE.SM};
  font-family: ${FONTS.FAMILY.PRIMARY};
  color: ${COLORS.TEXT};
  background-color: ${(p) => (p.$active ? COLORS.SURFACE_NEUTRAL_HOVER : COLORS.TRANSPARENT)};
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
  }
`;

const EmptyHint = styled.li`
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export function SearchCombobox({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled = false,
  allowCustomValue = false,
  emptyMessage = "No matches",
  maxSuggestions = 12,
  id,
}: SearchComboboxProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const listId = `${inputId}-list`;
  const [query, setQuery] = React.useState(value?.label ?? "");
  const [open, setOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const suggestions = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options.slice(0, maxSuggestions);
    return options
      .filter(
        (option) =>
          option.label.toLowerCase().includes(normalized) ||
          option.value.toLowerCase().includes(normalized),
      )
      .slice(0, maxSuggestions);
  }, [maxSuggestions, options, query]);

  React.useEffect(() => {
    setQuery(value?.label ?? "");
    if (!value) setOpen(false);
  }, [value]);

  React.useEffect(() => {
    setHighlightIndex(0);
  }, [query, suggestions.length]);

  React.useEffect(() => {
    function onDocPointer(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, []);

  function selectOption(option: SearchComboboxOption) {
    onChange(option);
    setQuery(option.label);
    setOpen(false);
  }

  function commitCustomValue() {
    const next = query.trim();
    if (!next) {
      onChange(null);
      return;
    }
    if (value?.label === next) return;
    onChange({ value: next, label: next });
  }

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setQuery(next);
    setOpen(true);
    if (value && next !== value.label) onChange(null);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((index) => Math.min(index + 1, Math.max(0, suggestions.length - 1)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      if (open && suggestions[highlightIndex]) {
        event.preventDefault();
        selectOption(suggestions[highlightIndex]!);
        return;
      }
      if (allowCustomValue) {
        event.preventDefault();
        commitCustomValue();
        setOpen(false);
      }
    }
  }

  function onBlur() {
    if (allowCustomValue) commitCustomValue();
  }

  const showList = open && !disabled;

  return (
    <FormFieldRoot ref={wrapRef} $hasLabel>
      <FormFieldLabelSlot>
        <FormFieldLabel htmlFor={inputId}>{label}</FormFieldLabel>
      </FormFieldLabelSlot>
      <FormFieldControlSlot>
        <InputWrap>
          <SearchInput
            id={inputId}
            type="search"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            disabled={disabled}
            $hasError={!!error}
            onChange={onInputChange}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
          />
          {showList ? (
            <Listbox id={listId} role="listbox">
              {suggestions.length === 0 ? (
                <EmptyHint role="presentation">{emptyMessage}</EmptyHint>
              ) : (
                suggestions.map((option, index) => (
                  <li key={option.value} role="presentation">
                    <OptionBtn
                      type="button"
                      role="option"
                      aria-selected={value?.value === option.value}
                      $active={index === highlightIndex}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectOption(option)}
                    >
                      {option.label}
                    </OptionBtn>
                  </li>
                ))
              )}
            </Listbox>
          ) : null}
        </InputWrap>
      </FormFieldControlSlot>
      <FormFieldMetaSlot>
        {error ? <FormFieldError id={`${inputId}-error`}>{error}</FormFieldError> : null}
      </FormFieldMetaSlot>
    </FormFieldRoot>
  );
}
