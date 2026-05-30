"use client";

import styled from "styled-components";
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
  gap: ${SPACING.THREE};
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
  font-weight: ${FONTS.WEIGHT.MEDIUM};
`;

const Pct = styled.span`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const StageGrid = styled.ul<{ $count: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $count }) => $count}, minmax(0, 1fr));
  gap: ${SPACING.THREE};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const StageColumn = styled.li`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const StageTrack = styled.div`
  height: ${SPACING.ONE};
  width: 100%;
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.MUTED};
`;

const StageFill = styled.div<{ $done: boolean }>`
  height: 100%;
  width: ${({ $done }) => ($done ? "100%" : "0%")};
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.HEADER};
  transition: width 0.3s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const stageLabelStyles = `
  display: block;
  width: 100%;
  margin: 0;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.XS};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StageLabel = styled.span<{ $done: boolean }>`
  ${stageLabelStyles}
  font-weight: ${({ $done }) => ($done ? FONTS.WEIGHT.MEDIUM : FONTS.WEIGHT.NORMAL)};
  color: ${({ $done }) => ($done ? COLORS.HEADER : COLORS.MUTED_FOREGROUND)};
`;

const StageLabelButton = styled.button`
  ${stageLabelStyles}
  padding: 0;
  border: none;
  background: none;
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.MUTED_FOREGROUND};
  cursor: pointer;
  text-align: center;

  &:hover {
    color: ${COLORS.ACTION_PRIMARY};
  }
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
        <Pct>{pct}%</Pct>
      </Top>
      <StageGrid $count={Math.max(items.length, 1)} aria-label="Profile setup stages">
        {items.map((item) => {
          const canJump = Boolean(onNavigateTab && item.editTab && !item.done);
          return (
            <StageColumn key={item.label}>
              <StageTrack
                role="progressbar"
                aria-label={item.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={item.done ? 100 : 0}
              >
                <StageFill $done={item.done} />
              </StageTrack>
              {canJump ? (
                <StageLabelButton type="button" onClick={() => onNavigateTab?.(item.editTab!)}>
                  {item.label}
                </StageLabelButton>
              ) : (
                <StageLabel $done={item.done}>{item.label}</StageLabel>
              )}
            </StageColumn>
          );
        })}
      </StageGrid>
    </Wrap>
  );
}
