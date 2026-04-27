"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { saveSubjectsAction, type ActionResult } from "@/app/(app)/profile/actions";

export interface SubjectOption {
  id: string;
  name: string;
}

export interface TeacherSubjectsFormProps {
  allSubjects: SubjectOption[];
  initial: Array<{ subjectId: string; defaultCap: number | null }>;
  globalCap: number;
}

interface Row {
  selected: boolean;
  defaultCap: number;
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
  display: grid;
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const RowItem = styled.li<{ $selected: boolean }>`
  display: flex;
  align-items: center;
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
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${SPACING.TWO};
  text-align: right;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};

  &:disabled {
    opacity: 0.5;
  }
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

export function TeacherSubjectsForm({
  allSubjects,
  initial,
  globalCap,
}: TeacherSubjectsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  const initialMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const i of initial) map.set(i.subjectId, i.defaultCap ?? Math.min(10, globalCap));
    return map;
  }, [initial, globalCap]);

  const [rows, setRows] = React.useState<Record<string, Row>>(() => {
    const out: Record<string, Row> = {};
    for (const s of allSubjects) {
      const existing = initialMap.get(s.id);
      out[s.id] = {
        selected: existing !== undefined,
        defaultCap: existing ?? Math.min(10, globalCap),
      };
    }
    return out;
  });

  function toggle(id: string) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id]!, selected: !prev[id]!.selected } }));
  }

  function setCap(id: string, cap: number) {
    const clamped = Math.max(1, Math.min(globalCap, Math.floor(cap) || 1));
    setRows((prev) => ({ ...prev, [id]: { ...prev[id]!, defaultCap: clamped } }));
  }

  const selectedCount = Object.values(rows).filter((r) => r.selected).length;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subjects = Object.entries(rows)
      .filter(([, r]) => r.selected)
      .map(([subjectId, r]) => ({ subjectId, defaultCap: r.defaultCap }));
    const fd = new FormData();
    fd.append("subjects", JSON.stringify({ subjects }));
    startTransition(async () => {
      const res = await saveSubjectsAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <Form onSubmit={onSubmit}>
      <Hint>
        Pick the subjects you teach. For each, set a class size limit that
        applies to new class periods (admin cap: {globalCap}).
      </Hint>
      <Grid>
        {allSubjects.map((s) => {
          const row = rows[s.id]!;
          return (
            <RowItem key={s.id} $selected={row.selected}>
              <RowLabel>
                <Checkbox
                  type="checkbox"
                  checked={row.selected}
                  onChange={() => toggle(s.id)}
                />
                <SubjectName>{s.name}</SubjectName>
              </RowLabel>
              <CapInput
                type="number"
                aria-label={`Class size limit for ${s.name}`}
                value={row.defaultCap}
                min={1}
                max={globalCap}
                disabled={!row.selected}
                onChange={(e) => setCap(s.id, Number(e.target.value))}
              />
            </RowItem>
          );
        })}
      </Grid>
      {result && !result.ok ? <ErrorText>{result.error}</ErrorText> : null}
      <Footer>
        <Counter>
          {selectedCount} subject{selectedCount === 1 ? "" : "s"} selected
        </Counter>
        <Button type="submit" isLoading={isPending} disabled={selectedCount === 0}>
          Save subjects
        </Button>
      </Footer>
    </Form>
  );
}
