"use client";

import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface ProfileCompletenessItem {
  label: string;
  done: boolean;
  editTab?: string;
}

export interface ProfileCompletenessBarProps {
  items: ProfileCompletenessItem[];
  onNavigateTab?: (tab: string) => void;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Strong = styled.strong`
  color: ${COLORS.HEADER};
`;

const Track = styled.div`
  height: 0.5rem;
  width: 100%;
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.MUTED};
`;

const Fill = styled.div`
  height: 100%;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.HEADER};
  transition: width 0.3s ease;
`;

const PillList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
  padding-top: ${SPACING.ONE};
  margin: 0;
  list-style: none;
`;

const PillButton = styled.button<{ $done: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: ${LAYOUT.RADIUS.FULL};
  padding: 0.125rem 0.625rem;
  font-size: ${FONTS.SIZE.XS};
  border: 1px solid;
  cursor: pointer;
  font: inherit;
  text-align: left;

  ${(p) =>
    p.$done
      ? css`
          border-color: rgba(22, 163, 74, 0.3);
          background-color: rgba(22, 163, 74, 0.1);
          color: ${COLORS.SUCCESS};
        `
      : css`
          border-color: ${COLORS.BORDER};
          background-color: ${COLORS.BACKGROUND};
          color: ${COLORS.MUTED_FOREGROUND};

          &:hover {
            border-color: ${COLORS.PRIMARY};
            color: ${COLORS.HEADER};
          }
        `}
`;

const Pill = styled.span<{ $done: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: ${LAYOUT.RADIUS.FULL};
  padding: 0.125rem 0.625rem;
  font-size: ${FONTS.SIZE.XS};
  border: 1px solid;

  ${(p) =>
    p.$done
      ? css`
          border-color: rgba(22, 163, 74, 0.3);
          background-color: rgba(22, 163, 74, 0.1);
          color: ${COLORS.SUCCESS};
        `
      : css`
          border-color: ${COLORS.BORDER};
          background-color: ${COLORS.BACKGROUND};
          color: ${COLORS.MUTED_FOREGROUND};
        `}
`;

const PillRow = styled.li`
  display: inline-flex;
  list-style: none;
`;

const PillIcon = styled.span`
  font-size: ${FONTS.SIZE.MICRO};
`;

export function ProfileCompletenessBar({ items, onNavigateTab }: ProfileCompletenessBarProps) {
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <Wrap>
      <Top>
        <span>
          Profile completeness: <Strong>{done}/{total}</Strong>
        </span>
        <span>{pct}%</span>
      </Top>
      <Track>
        <Fill
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        />
      </Track>
      <PillList>
        {items.map((i) => {
          const canJump = Boolean(onNavigateTab && i.editTab && !i.done);
          return (
            <PillRow key={i.label}>
              {canJump ? (
                <PillButton
                  type="button"
                  $done={i.done}
                  onClick={() => onNavigateTab?.(i.editTab!)}
                >
                  <PillIcon aria-hidden>{i.done ? "✓" : "○"}</PillIcon>
                  {i.label}
                </PillButton>
              ) : (
                <Pill $done={i.done}>
                  <PillIcon aria-hidden>{i.done ? "✓" : "○"}</PillIcon>
                  {i.label}
                </Pill>
              )}
            </PillRow>
          );
        })}
      </PillList>
    </Wrap>
  );
}
