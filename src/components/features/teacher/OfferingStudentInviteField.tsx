"use client";

import { X } from "lucide-react";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import {
  APP_INPUT_HEIGHT,
  FORM_FIELD,
  formFieldControlBorder,
} from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface OfferingInviteableStudent {
  id: string;
  name: string;
  email: string;
}

export interface OfferingStudentInviteFieldProps {
  students: OfferingInviteableStudent[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
  disabled?: boolean;
}

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  min-width: 0;
  position: relative;
`;

const Label = styled.label`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${COLORS.HEADER};
`;

const Hint = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
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
    color: ${COLORS.INPUT_PLACEHOLDER};
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

const OptionMeta = styled.span`
  display: block;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const EmptyHint = styled.li`
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const SelectedList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const SelectedChip = styled.li`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
  max-width: 100%;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.ONE} ${SPACING.TWO};
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.HEADER};
`;

const ChipLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  padding: 0;
  background: none;
  color: ${COLORS.MUTED_FOREGROUND};
  cursor: pointer;

  &:hover {
    color: ${COLORS.DESTRUCTIVE};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_28};
    outline-offset: ${SPACING.ONE};
    border-radius: ${LAYOUT.RADIUS.FULL};
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
`;

const EmptyState = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const VisuallyHidden = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

function filterStudents(
  students: OfferingInviteableStudent[],
  selectedIds: Set<string>,
  query: string,
): OfferingInviteableStudent[] {
  const available = students.filter((s) => !selectedIds.has(s.id));
  const n = normalizeQuery(query);
  if (!n) return available.slice(0, 12);
  return available
    .filter(
      (s) =>
        s.name.toLowerCase().includes(n) ||
        s.email.toLowerCase().includes(n),
    )
    .slice(0, 12);
}

export function OfferingStudentInviteField({
  students,
  selectedIds,
  onChange,
  error,
  disabled = false,
}: OfferingStudentInviteFieldProps) {
  const listId = React.useId();
  const inputId = React.useId();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(0);

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedStudents = React.useMemo(
    () =>
      selectedIds
        .map((id) => students.find((s) => s.id === id))
        .filter((s): s is OfferingInviteableStudent => s != null),
    [selectedIds, students],
  );
  const suggestions = React.useMemo(
    () => filterStudents(students, selectedSet, query),
    [students, selectedSet, query],
  );

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

  function addStudent(student: OfferingInviteableStudent) {
    if (disabled || selectedSet.has(student.id)) return;
    onChange([...selectedIds, student.id]);
    setQuery("");
    setOpen(true);
  }

  function removeStudent(id: string) {
    if (disabled) return;
    onChange(selectedIds.filter((sid) => sid !== id));
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(true);
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
      addStudent(suggestions[highlightIndex]!);
    }
  }

  const showList = open && !disabled && students.length > 0;
  const listEmptyMessage =
    students.length === 0
      ? "No students are registered on the platform yet."
      : suggestions.length === 0
        ? selectedSet.size === students.length && !query
          ? "All students have been invited."
          : "No matching students"
        : null;

  return (
    <Field ref={wrapRef}>
      <Label htmlFor={inputId}>Invited students</Label>
      <Hint>Only selected students can see and sign up for this reserved period.</Hint>
      {students.length === 0 ? (
        <EmptyState>No students are registered on the platform yet.</EmptyState>
      ) : (
        <>
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
              placeholder="Search students by name or email…"
              value={query}
              disabled={disabled}
              $hasError={!!error}
              onChange={onInputChange}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
            />
            {showList ? (
              <Listbox id={listId} role="listbox">
                {listEmptyMessage ? (
                  <EmptyHint role="presentation">{listEmptyMessage}</EmptyHint>
                ) : (
                  suggestions.map((student, index) => (
                    <li key={student.id} role="presentation">
                      <OptionBtn
                        type="button"
                        role="option"
                        aria-selected={false}
                        $active={index === highlightIndex}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addStudent(student)}
                      >
                        {student.name}
                        <OptionMeta>{student.email}</OptionMeta>
                      </OptionBtn>
                    </li>
                  ))
                )}
              </Listbox>
            ) : null}
          </InputWrap>
          {selectedStudents.length > 0 ? (
            <SelectedList aria-label="Invited students">
              {selectedStudents.map((student) => (
                <SelectedChip key={student.id}>
                  <ChipLabel>{student.name}</ChipLabel>
                  <RemoveBtn
                    type="button"
                    aria-label={`Remove ${student.name}`}
                    disabled={disabled}
                    onClick={() => removeStudent(student.id)}
                  >
                    <X size={ICON_SIZE.XS} strokeWidth={ICON_STROKE.MEDIUM} aria-hidden />
                  </RemoveBtn>
                </SelectedChip>
              ))}
            </SelectedList>
          ) : null}
        </>
      )}
      <VisuallyHidden aria-hidden>
        {selectedIds.map((id) => (
          <input key={id} type="hidden" name="invitedStudentProfileIds" value={id} />
        ))}
      </VisuallyHidden>
      {error ? <ErrorText id={`${inputId}-error`}>{error}</ErrorText> : null}
    </Field>
  );
}
