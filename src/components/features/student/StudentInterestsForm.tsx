"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  saveStudentInterestsAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";

export interface InterestSubject {
  id: string;
  name: string;
}

export interface StudentInterestsFormProps {
  allSubjects: InterestSubject[];
  initialSubjectIds: string[];
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Pill = styled.button<{ $active: boolean }>`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  text-align: left;
  font-size: ${FONTS.SIZE.SM};
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  ${(p) =>
    p.$active
      ? css`
          border-color: ${COLORS.HEADER};
          background-color: ${COLORS.HEADER};
          color: ${COLORS.WHITE};
        `
      : css`
          background-color: ${COLORS.FOREGROUND};
          color: ${COLORS.HEADER};

          &:hover {
            background-color: rgba(23, 32, 51, 0.03);
          }
        `}
`;

const PillName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
`;

const Check = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1rem;
  width: 1rem;
  flex-shrink: 0;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${(p) => (p.$active ? COLORS.WHITE : COLORS.BORDER)};
  background-color: ${(p) => (p.$active ? COLORS.WHITE : "transparent")};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
`;

const Counter = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export function StudentInterestsForm({
  allSubjects,
  initialSubjectIds,
}: StudentInterestsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(initialSubjectIds),
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    for (const id of selected) fd.append("subjectId", id);
    startTransition(async () => {
      const res = await saveStudentInterestsAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <Form onSubmit={onSubmit}>
      <Hint>
        Pick the subjects you want to learn. We use these to recommend the right
        teachers for you.
      </Hint>
      <Grid>
        {allSubjects.map((s) => {
          const isOn = selected.has(s.id);
          return (
            <li key={s.id}>
              <Pill
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={isOn}
                $active={isOn}
              >
                <PillName>{s.name}</PillName>
                <Check $active={isOn} aria-hidden>
                  {isOn ? (
                    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
                      <path
                        fill={COLORS.HEADER}
                        d="M6.173 11.47a.75.75 0 0 1-1.06 0L2.72 9.078a.75.75 0 0 1 1.06-1.06l1.863 1.863 5.74-5.741a.75.75 0 1 1 1.06 1.06l-6.27 6.27Z"
                      />
                    </svg>
                  ) : null}
                </Check>
              </Pill>
            </li>
          );
        })}
      </Grid>
      {result && !result.ok ? <ErrorText>{result.error}</ErrorText> : null}
      <Footer>
        <Counter>
          {selected.size} interest{selected.size === 1 ? "" : "s"} selected
        </Counter>
        <Button type="submit" isLoading={isPending}>
          Save interests
        </Button>
      </Footer>
    </Form>
  );
}
