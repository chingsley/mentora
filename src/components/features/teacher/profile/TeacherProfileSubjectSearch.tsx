"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { APP_INPUT_HEIGHT, FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface TeacherProfileSubjectOption {
  id: string;
  name: string;
}

export interface TeacherProfileSubjectSearchProps {
  subjects: TeacherProfileSubjectOption[];
  value: TeacherProfileSubjectOption | null;
  onChange: (subject: TeacherProfileSubjectOption | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  width: 100%;
  position: relative;
`;

const Label = styled.label`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

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
  line-height: 1.4;
  color: ${COLORS.TEXT};
  background-color: inherit;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${(p) => formFieldControlBorder(p.$hasError)};
  box-shadow: ${BOX_SHADOW_INPUTS};
  outline: none;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${COLORS.MUTED_FOREGROUND};
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

const ErrorText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
`;

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

function filterSubjects(subjects: TeacherProfileSubjectOption[], query: string): TeacherProfileSubjectOption[] {
  const n = normalizeQuery(query);
  if (!n) return subjects.slice(0, 12);
  return subjects.filter((s) => s.name.toLowerCase().includes(n)).slice(0, 12);
}

export function TeacherProfileSubjectSearch({
  subjects,
  value,
  onChange,
  label = "Subject",
  placeholder = "Search subjects…",
  error,
  disabled = false,
}: TeacherProfileSubjectSearchProps) {
  const listId = React.useId();
  const inputId = React.useId();
  const [query, setQuery] = React.useState(value?.name ?? "");
  const [open, setOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const suggestions = React.useMemo(() => filterSubjects(subjects, query), [subjects, query]);

  React.useEffect(() => {
    setQuery(value?.name ?? "");
    if (!value) setOpen(false);
  }, [value]);

  React.useEffect(() => {
    setHighlightIndex(0);
  }, [query, suggestions.length]);

  React.useEffect(() => {
    function onDocPointer(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, []);

  function selectSubject(subject: TeacherProfileSubjectOption) {
    onChange(subject);
    setQuery(subject.name);
    setOpen(false);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setQuery(next);
    setOpen(true);
    if (value && next !== value.name) onChange(null);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && open && suggestions[highlightIndex]) {
      e.preventDefault();
      selectSubject(suggestions[highlightIndex]!);
    }
  }

  const showList = open && !disabled;

  return (
    <Field ref={wrapRef}>
      <Label htmlFor={inputId}>{label}</Label>
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
        />
        {showList ? (
          <Listbox id={listId} role="listbox">
            {suggestions.length === 0 ? (
              <EmptyHint role="presentation">No matching subjects</EmptyHint>
            ) : (
              suggestions.map((subject, index) => (
                <li key={subject.id} role="presentation">
                  <OptionBtn
                    type="button"
                    role="option"
                    aria-selected={value?.id === subject.id}
                    $active={index === highlightIndex}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSubject(subject)}
                  >
                    {subject.name}
                  </OptionBtn>
                </li>
              ))
            )}
          </Listbox>
        ) : null}
      </InputWrap>
      {error ? <ErrorText id={`${inputId}-error`}>{error}</ErrorText> : null}
    </Field>
  );
}
