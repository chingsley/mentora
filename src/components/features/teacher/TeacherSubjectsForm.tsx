"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useActionPending } from "@/hooks/useActionPending";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { saveSubjectsAction, type ActionResult } from "@/app/(app)/profile/actions";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TEACHER_PROFILE_ADD_COURSE } from "@/constants/teacherProfileCourse.constants";
import { isValidSubjectName, normalizeSubjectName } from "@/lib/subjectName";

export interface TeacherSubjectsFormInitialRow {
  subjectId?: string;
  subjectName: string;
  defaultCap: number | null;
  courseDescription: string;
  gradeLevel: string;
  syllabus: string;
}

export interface TeacherSubjectsFormProps {
  initial: TeacherSubjectsFormInitialRow[];
  globalCap: number;
  /** When set, tab footer submits this form via `form={formId}` */
  formId?: string;
  onPendingChange?: (pending: boolean) => void;
  onSaved?: () => void;
}

interface RowState {
  clientId: string;
  subjectId?: string;
  subjectName: string;
  defaultCap: number;
  courseDescription: string;
  gradeLevel: string;
  syllabus: string;
  expanded: boolean;
  showSyllabus: boolean;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const Hint = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Grid = styled.ul`
  display: flex;
  max-height: min(70vh, 36rem);
  flex-direction: column;
  gap: ${SPACING.TWO};
  overflow-y: auto;
  padding-right: ${SPACING.ONE};
`;

const RowItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  padding: ${SPACING.THREE};
  background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
`;

const TopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.THREE};
`;

const CapInput = styled.input`
  height: 2.25rem;
  width: 6rem;
  flex-shrink: 0;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${formFieldControlBorder(false)};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${SPACING.TWO};
  text-align: right;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
`;

const ExpandToggle = styled.button`
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.PRIMARY};
  cursor: pointer;
  text-decoration: underline;
`;

const RemoveButton = styled.button`
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.DESTRUCTIVE};
  cursor: pointer;
  text-decoration: underline;
`;

const MetaBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const NameField = styled(Field)`
  flex: 1 1 12rem;
  min-width: 10rem;
`;

const FieldLabel = styled.span`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const TextInput = styled.input`
  width: 100%;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${formFieldControlBorder(false)};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};

  &:focus {
    outline: none;
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const TextArea = styled.textarea`
  min-height: 4rem;
  width: 100%;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${formFieldControlBorder(false)};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const SyllabusArea = styled(TextArea)`
  min-height: 6rem;
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.TWO};
  flex-wrap: wrap;
`;

const Counter = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ExternalHint = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

function newClientId(): string {
  return `row-${Math.random().toString(36).slice(2, 11)}`;
}

function buildRows(initial: TeacherSubjectsFormInitialRow[], globalCap: number): RowState[] {
  return initial.map((r) => ({
    clientId: r.subjectId ?? newClientId(),
    subjectId: r.subjectId,
    subjectName: r.subjectName,
    defaultCap: r.defaultCap ?? Math.min(10, globalCap),
    courseDescription: r.courseDescription ?? "",
    gradeLevel: r.gradeLevel ?? "",
    syllabus: r.syllabus ?? "",
    expanded: true,
    showSyllabus: Boolean(r.syllabus?.trim()),
  }));
}

function emptyRow(globalCap: number): RowState {
  return {
    clientId: newClientId(),
    subjectName: "",
    defaultCap: Math.min(10, globalCap),
    courseDescription: "",
    gradeLevel: "",
    syllabus: "",
    expanded: true,
    showSyllabus: false,
  };
}

export function TeacherSubjectsForm({
  initial,
  globalCap,
  formId,
  onPendingChange,
  onSaved,
}: TeacherSubjectsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useActionPending();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  const [rows, setRows] = React.useState<RowState[]>(() => buildRows(initial, globalCap));

  React.useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setRows(buildRows(initial, globalCap));
    });
    return () => {
      active = false;
    };
  }, [initial, globalCap]);

  function patchRow(clientId: string, patch: Partial<RowState>) {
    setRows((prev) => prev.map((r) => (r.clientId === clientId ? { ...r, ...patch } : r)));
  }

  function removeRow(clientId: string) {
    setRows((prev) => prev.filter((r) => r.clientId !== clientId));
  }

  function setCap(clientId: string, cap: number) {
    const clamped = Math.max(1, Math.min(globalCap, Math.floor(cap) || 1));
    patchRow(clientId, { defaultCap: clamped });
  }

  const validCount = rows.filter((r) => isValidSubjectName(r.subjectName)).length;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subjects = rows
      .filter((r) => isValidSubjectName(r.subjectName))
      .map((r) => ({
        subjectName: normalizeSubjectName(r.subjectName),
        defaultCap: r.defaultCap,
        courseDescription: r.courseDescription,
        gradeLevel: r.gradeLevel,
        syllabus: r.syllabus,
      }));
    const fd = new FormData();
    fd.append("subjects", JSON.stringify({ subjects }));
    startTransition(async () => {
      onPendingChange?.(true);
      try {
        const res = await saveSubjectsAction(fd);
        setResult(res);
        if (res.ok) {
          router.refresh();
          onSaved?.();
        }
      } finally {
        onPendingChange?.(false);
      }
    });
  }

  return (
    <Form id={formId} onSubmit={onSubmit}>
      <Hint>
        Add each course you teach by name, set max class size, and describe it. Syllabus is optional.
      </Hint>
      <Grid>
        {rows.map((row) => (
          <RowItem key={row.clientId}>
            <TopRow>
              <NameField>
                <FieldLabel>Course name</FieldLabel>
                <TextInput
                  aria-label="Course name"
                  value={row.subjectName}
                  maxLength={TEACHER_PROFILE_ADD_COURSE.SUBJECT_NAME_MAX}
                  placeholder="e.g. Swimming lessons, AP Calculus"
                  onChange={(e) => patchRow(row.clientId, { subjectName: e.target.value })}
                />
              </NameField>
              <ExpandToggle type="button" onClick={() => patchRow(row.clientId, { expanded: !row.expanded })}>
                {row.expanded ? "Hide details" : "Details"}
              </ExpandToggle>
              <CapInput
                type="number"
                aria-label={`Class size limit for ${row.subjectName || "course"}`}
                value={row.defaultCap}
                min={1}
                max={globalCap}
                onChange={(e) => setCap(row.clientId, Number(e.target.value))}
              />
              {rows.length > 1 ? (
                <RemoveButton type="button" onClick={() => removeRow(row.clientId)}>
                  Remove
                </RemoveButton>
              ) : null}
            </TopRow>
            {row.expanded ? (
              <MetaBlock>
                <Field>
                  <FieldLabel>Course description</FieldLabel>
                  <TextArea
                    value={row.courseDescription}
                    onChange={(e) => patchRow(row.clientId, { courseDescription: e.target.value })}
                    rows={3}
                    placeholder="What students learn, materials, teaching style…"
                  />
                </Field>
                <Field>
                  <FieldLabel>Grade / level</FieldLabel>
                  <TextInput
                    value={row.gradeLevel}
                    onChange={(e) => patchRow(row.clientId, { gradeLevel: e.target.value })}
                    placeholder="e.g. Grade 6, University, Advanced"
                  />
                </Field>
                {row.showSyllabus ? (
                  <Field>
                    <FieldLabel>Syllabus (optional)</FieldLabel>
                    <SyllabusArea
                      value={row.syllabus}
                      onChange={(e) => patchRow(row.clientId, { syllabus: e.target.value })}
                      placeholder="Outline, topics by week, expectations…"
                    />
                  </Field>
                ) : (
                  <ExpandToggle type="button" onClick={() => patchRow(row.clientId, { showSyllabus: true })}>
                    + Add syllabus (optional)
                  </ExpandToggle>
                )}
              </MetaBlock>
            ) : null}
          </RowItem>
        ))}
      </Grid>
      <Button type="button" variant="secondary" onClick={() => setRows((prev) => [...prev, emptyRow(globalCap)])}>
        Add another course
      </Button>
      {result && !result.ok ? <ErrorText>{result.error}</ErrorText> : null}
      <Footer>
        <Counter>
          {validCount} course{validCount === 1 ? "" : "s"} ready to save
        </Counter>
        {formId ? (
          <ExternalHint>Use Save below to store changes.</ExternalHint>
        ) : (
          <Button type="submit" isLoading={isPending} disabled={validCount === 0}>
            Save subjects
          </Button>
        )}
      </Footer>
    </Form>
  );
}
