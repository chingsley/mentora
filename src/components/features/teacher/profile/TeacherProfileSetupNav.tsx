"use client";

import { Check } from "lucide-react";
import styled, { css } from "styled-components";
import type { ProfileCompletenessItem } from "@/components/features/teacher/ProfileCompletenessBar";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { BOX_SHADOW_INPUTS, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  TEACHER_PROFILE_EDIT_TABS,
  TEACHER_PROFILE_TAB_LABEL,
  type TeacherProfileEditTabId,
} from "./teacherProfileTabIds";

export interface TeacherProfileSetupNavProps {
  items: ProfileCompletenessItem[];
  currentStep: TeacherProfileEditTabId;
  onNavigateStep: (step: TeacherProfileEditTabId) => void;
}

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
`;

const ProgressTrack = styled.div`
  height: ${SPACING.ONE};
  width: 100%;
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.SURFACE_OFF_WHITE};
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => `${$pct}%`};
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.ACTION_PRIMARY};
  transition: width 0.35s cubic-bezier(0.32, 0.72, 0, 1);

  ${LAYOUT.MEDIA.REDUCED_MOTION} {
    transition: none;
  }
`;

const StepMeta = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const SegmentedList = styled.ol`
  display: flex;
  width: 100%;
  gap: ${SPACING.ONE};
  margin: 0;
  padding: ${SPACING.ONE};
  list-style: none;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.SURFACE_OFF_WHITE};
  overflow: hidden;
`;

const SegmentItem = styled.li`
  display: flex;
  flex: 1 1 0;
  min-width: 0;
`;

const segmentStyles = css<{ $active: boolean; $done: boolean; $clickable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.ONE};
  width: 100%;
  min-width: 0;
  padding: ${SPACING.TWO} ${SPACING.TWO};
  border: none;
  border-radius: ${LAYOUT.RADIUS.FULL};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${({ $active }) => ($active ? FONTS.WEIGHT.SEMIBOLD : FONTS.WEIGHT.MEDIUM)};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  text-align: center;
  white-space: nowrap;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;

  ${({ $active, $done, $clickable }) => {
    if ($active) {
      return css`
        background-color: ${COLORS.FOREGROUND};
        color: ${COLORS.HEADER};
        box-shadow: ${BOX_SHADOW_INPUTS};
      `;
    }
    if ($done) {
      return css`
        background-color: ${COLORS.TRANSPARENT};
        color: ${COLORS.ACTION_PRIMARY};
        cursor: ${$clickable ? "pointer" : "default"};
      `;
    }
    return css`
      background-color: ${COLORS.TRANSPARENT};
      color: ${COLORS.MUTED_FOREGROUND};
      cursor: default;
    `;
  }}

  ${({ $clickable, $active }) =>
    $clickable &&
    !$active &&
    css`
      &:hover {
        color: ${COLORS.HEADER};
      }
    `}

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
  }

  ${LAYOUT.MEDIA.REDUCED_MOTION} {
    transition: none;
  }
`;

const SegmentButton = styled.button<{ $active: boolean; $done: boolean; $clickable: boolean }>`
  ${segmentStyles}
`;

const SegmentStatus = styled.span<{ $active: boolean; $done: boolean; $clickable: boolean }>`
  ${segmentStyles}
`;

const SegmentLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

function stepIndex(step: TeacherProfileEditTabId): number {
  return TEACHER_PROFILE_EDIT_TABS.indexOf(step);
}

export function TeacherProfileSetupNav({
  items,
  currentStep,
  onNavigateStep,
}: TeacherProfileSetupNavProps) {
  const done = items.filter((item) => item.done).length;
  const total = items.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const currentIndex = stepIndex(currentStep);

  return (
    <Nav aria-label="Profile setup progress">
      <StepMeta>
        Step {currentIndex + 1} of {TEACHER_PROFILE_EDIT_TABS.length}
      </StepMeta>
      <ProgressTrack
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Overall setup progress"
      >
        <ProgressFill $pct={pct} />
      </ProgressTrack>
      <SegmentedList>
        {TEACHER_PROFILE_EDIT_TABS.map((tab, index) => {
          const item = items.find((entry) => entry.editTab === tab);
          const doneStep = item?.done ?? false;
          const active = tab === currentStep;
          const canNavigate = doneStep && !active;
          const label = TEACHER_PROFILE_TAB_LABEL[tab];

          if (canNavigate) {
            return (
              <SegmentItem key={tab}>
                <SegmentButton
                  type="button"
                  $active={active}
                  $done={doneStep}
                  $clickable
                  aria-current={active ? "step" : undefined}
                  onClick={() => onNavigateStep(tab)}
                >
                  <Check size={ICON_SIZE.XS} strokeWidth={ICON_STROKE.BOLD} aria-hidden />
                  <SegmentLabel>{label}</SegmentLabel>
                </SegmentButton>
              </SegmentItem>
            );
          }

          return (
            <SegmentItem key={tab}>
              <SegmentStatus $active={active} $done={doneStep} $clickable={false} aria-current={active ? "step" : undefined}>
                {doneStep ? (
                  <Check size={ICON_SIZE.XS} strokeWidth={ICON_STROKE.BOLD} aria-hidden />
                ) : (
                  <span aria-hidden>{index + 1}</span>
                )}
                <SegmentLabel>{label}</SegmentLabel>
              </SegmentStatus>
            </SegmentItem>
          );
        })}
      </SegmentedList>
    </Nav>
  );
}
