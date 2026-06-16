"use client";

import * as React from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_CARD, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { useTeacherProfileSetupMode } from "./TeacherProfileSetupContext";

const Panel = styled.section<{ $setup?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
  width: 100%;
  text-align: left;

  ${({ $setup }) =>
    $setup
      ? css`
          padding: ${SPACING.SIX};
          border-radius: ${LAYOUT.RADIUS.LG};
          border: 1px solid ${COLORS.MARKETING_BORDER};
          background-color: ${COLORS.FOREGROUND};
          box-shadow: ${BOX_SHADOW_CARD};
        `
      : css`
          padding: ${SPACING.SIX} 0 0;
          border-top: 1px solid ${COLORS.HEADER_BORDER_15};
          background-color: ${COLORS.TRANSPARENT};
          box-shadow: none;

          &:first-of-type {
            padding-top: 0;
            border-top: none;
          }
        `}
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  width: 100%;
  text-align: left;
`;

const SectionStepLabel = styled.span`
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${COLORS.ACTION_PRIMARY};
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  line-height: ${FONTS.LINE_HEIGHT.SNUG};
  color: ${COLORS.HEADER};
`;

const SectionHint = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const SectionBody = styled.div<{ $contentAlign: "start" | "center" }>`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  width: 100%;
  align-items: ${({ $contentAlign }) => ($contentAlign === "center" ? "center" : "stretch")};
  text-align: left;
`;

export interface TeacherProfileFormSectionProps {
  id?: string;
  title: string;
  hint?: string;
  /** Shown in setup mode only, e.g. "1 of 3". */
  stepLabel?: string;
  /** Centers section body content (e.g. profile photo upload) while keeping the header left-aligned. */
  contentAlign?: "start" | "center";
  children: React.ReactNode;
}

export function TeacherProfileFormSection({
  id,
  title,
  hint,
  stepLabel,
  contentAlign = "start",
  children,
}: TeacherProfileFormSectionProps) {
  const setupMode = useTeacherProfileSetupMode();
  const titleId = id ?? undefined;

  return (
    <Panel aria-labelledby={titleId} $setup={setupMode}>
      <SectionHeader>
        {setupMode && stepLabel ? <SectionStepLabel>{stepLabel}</SectionStepLabel> : null}
        <SectionTitle id={titleId}>{title}</SectionTitle>
        {hint ? <SectionHint>{hint}</SectionHint> : null}
      </SectionHeader>
      <SectionBody $contentAlign={contentAlign}>{children}</SectionBody>
    </Panel>
  );
}

/** Vertical stack of {@link TeacherProfileFormSection} panels with consistent spacing. */
export const TeacherProfileFormSectionStack = styled.div<{ $setup?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $setup }) => ($setup ? SPACING.SIX : SPACING.TWO)};
  width: 100%;
`;
