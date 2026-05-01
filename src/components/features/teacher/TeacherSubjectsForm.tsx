"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { saveSubjectsAction, type ActionResult } from "@/app/(app)/profile/actions";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface SubjectOption {
  id: string;
  name: string;
}

export interface TeacherSubjectsFormInitialRow {
  subjectId: string;
  defaultCap: number | null;
  courseDescription: string;
  gradeLevel: string;
  syllabus: string;
}

export interface TeacherSubjectsFormProps {
  allSubjects: SubjectOption[];
  initial: TeacherSubjectsFormInitialRow[];
  globalCap: number;
  /** When set, tab footer submits this form via `form={formId}` */
  formId?: string;
  onPendingChange?: (pending: boolean) => void;
  onSaved?: () => void;
}

interface Row {
  selected: boolean;
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

const RowItem = styled.li<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid;
  padding: ${SPACING.THREE};
  transition: background-color 0.15s ease, border-color 0.15s ease;

  ${(p) =>
    p.$selected
      ? css`
          border-color: rgba(23, 32, 51, 0.3);
          background-color: rgba(23, 32, 51, 0.03);
        `
      : css`
          border-color: ${COLORS.BORDER};
        `}
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
`;

const RowLabel = styled.label`
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: ${SPACING.THREE};
`;

const Checkbox = styled.input`
  height: 1rem;
  width: 1rem;
  flex-shrink: 0;
  accent-color: ${COLORS.HEADER};
`;

const SubjectName = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
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

  &:disabled {
    opacity: 0.5;
  }
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

const MetaBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  padding-left: 1.75rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
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
`;

const Counter = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ExternalHint = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

function buildRows(
  allSubjects: SubjectOption[],
  initial: TeacherSubjectsFormInitialRow[],
  globalCap: number,
): Record<string, Row> {
  const initialById = new Map(initial.map((r) => [r.subjectId, r]));
  const out: Record<string, Row> = {};
  for (const s of allSubjects) {
    const ex = initialById.get(s.id);
    out[s.id] = {
      selected: ex !== undefined,
      defaultCap: ex?.defaultCap ?? Math.min(10, globalCap),
      courseDescription: ex?.courseDescription ?? "",
      gradeLevel: ex?.gradeLevel ?? "",
      syllabus: ex?.syllabus ?? "",
      expanded: ex !== undefined,
      showSyllabus: Boolean(ex?.syllabus?.trim()),
    };
  }
  return out;
}

export function TeacherSubjectsForm({
  allSubjects,
  initial,
  globalCap,
  formId,
  onPendingChange,
  onSaved,
}: TeacherSubjectsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  const [rows, setRows] = React.useState<Record<string, Row>>(() =>
    buildRows(allSubjects, initial, globalCap),
  );

  React.useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) setRows(buildRows(allSubjects, initial, globalCap));
    });
    return () => {
      active = false;
    };
  }, [allSubjects, initial, globalCap]);

  function toggle(id: string) {
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id]!, selected: !prev[id]!.selected, expanded: !prev[id]!.selected ? true : prev[id]!.expanded },
    }));
  }

  function setCap(id: string, cap: number) {
    const clamped = Math.max(1, Math.min(globalCap, Math.floor(cap) || 1));
    setRows((prev) => ({ ...prev, [id]: { ...prev[id]!, defaultCap: clamped } }));
  }

  function patchRow(id: string, patch: Partial<Row>) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id]!, ...patch } }));
  }

  const selectedCount = Object.values(rows).filter((r) => r.selected).length;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subjects = Object.entries(rows)
      .filter(([, r]) => r.selected)
      .map(([subjectId, r]) => ({
        subjectId,
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
        Select subjects, set max class size, and describe each course. Syllabus is optional.
      </Hint>
      <Grid>
        {allSubjects.map((s) => {
          const row = rows[s.id]!;
          return (
            <RowItem key={s.id} $selected={row.selected}>
              <TopRow>
                <RowLabel>
                  <Checkbox
                    type="checkbox"
                    checked={row.selected}
                    onChange={() => toggle(s.id)}
                  />
                  <SubjectName>{s.name}</SubjectName>
                </RowLabel>
                <ExpandToggle
                  type="button"
                  disabled={!row.selected}
                  onClick={() => patchRow(s.id, { expanded: !row.expanded })}
                >
                  {row.expanded ? "Hide details" : "Details"}
                </ExpandToggle>
                <CapInput
                  type="number"
                  aria-label={`Class size limit for ${s.name}`}
                  value={row.defaultCap}
                  min={1}
                  max={globalCap}
                  disabled={!row.selected}
                  onChange={(e) => setCap(s.id, Number(e.target.value))}
                />
              </TopRow>
              {row.selected && row.expanded ? (
                <MetaBlock>
                  <Field>
                    <FieldLabel>Course description</FieldLabel>
                    <TextArea
                      aria-label={`Description for ${s.name}`}
                      value={row.courseDescription}
                      onChange={(e) => patchRow(s.id, { courseDescription: e.target.value })}
                      rows={3}
                      placeholder="What students learn, materials, teaching style…"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Grade / level</FieldLabel>
                    <TextInput
                      aria-label={`Grade level for ${s.name}`}
                      value={row.gradeLevel}
                      onChange={(e) => patchRow(s.id, { gradeLevel: e.target.value })}
                      placeholder="e.g. Grade 6, University, Advanced"
                    />
                  </Field>
                  {row.showSyllabus ? (
                    <Field>
                      <FieldLabel>Syllabus (optional)</FieldLabel>
                      <SyllabusArea
                        aria-label={`Syllabus for ${s.name}`}
                        value={row.syllabus}
                        onChange={(e) => patchRow(s.id, { syllabus: e.target.value })}
                        placeholder="Outline, topics by week, expectations…"
                      />
                    </Field>
                  ) : (
                    <ExpandToggle type="button" onClick={() => patchRow(s.id, { showSyllabus: true })}>
                      + Add syllabus (optional)
                    </ExpandToggle>
                  )}
                </MetaBlock>
              ) : null}
            </RowItem>
          );
        })}
      </Grid>
      {result && !result.ok ? <ErrorText>{result.error}</ErrorText> : null}
      <Footer>
        <Counter>
          {selectedCount} subject{selectedCount === 1 ? "" : "s"} selected
        </Counter>
        {formId ? <ExternalHint>Use Save below to store changes.</ExternalHint> : (
          <Button type="submit" isLoading={isPending} disabled={selectedCount === 0}>
            Save subjects
          </Button>
        )}
      </Footer>
    </Form>
  );
}
