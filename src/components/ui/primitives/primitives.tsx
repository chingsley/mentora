"use client";

import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export const PageWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

export const PageHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
`;

export const PageEyebrow = styled.p`
  font-size: ${FONTS.SIZE.XS};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${COLORS.MUTED_FOREGROUND};
`;

export const PageTitle = styled.h1`
  font-size: ${FONTS.SIZE["2XL"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

export const PageDescription = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  flex-wrap: wrap;
`;

export const SectionTitle = styled.h2`
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

export const SectionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

export const Heading2 = styled.h2`
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

export const Heading3 = styled.h3`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

export const Stack = styled.div<{ $gap?: keyof typeof SPACING }>`
  display: flex;
  flex-direction: column;
  gap: ${(p) => SPACING[p.$gap ?? "THREE"]};
`;

export const Cluster = styled.div<{ $gap?: keyof typeof SPACING; $wrap?: boolean }>`
  display: flex;
  align-items: center;
  flex-wrap: ${(p) => (p.$wrap ? "wrap" : "nowrap")};
  gap: ${(p) => SPACING[p.$gap ?? "TWO"]};
`;

export const Grid = styled.div<{ $cols?: number; $smCols?: number; $mdCols?: number; $gap?: keyof typeof SPACING }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols ?? 1}, minmax(0, 1fr));
  gap: ${(p) => SPACING[p.$gap ?? "FOUR"]};

  ${(p) =>
    p.$smCols &&
    css`
      ${LAYOUT.MEDIA.SM} {
        grid-template-columns: repeat(${p.$smCols}, minmax(0, 1fr));
      }
    `}

  ${(p) =>
    p.$mdCols &&
    css`
      ${LAYOUT.MEDIA.MD} {
        grid-template-columns: repeat(${p.$mdCols}, minmax(0, 1fr));
      }
    `}
`;

export const CardSurface = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.FOUR};
`;

export const Muted = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export const Strong = styled.span`
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

export const Pill = styled.span<{ $tone?: "default" | "success" | "warning" | "danger" | "info" }>`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
  border-radius: ${LAYOUT.RADIUS.FULL};
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  color: ${COLORS.HEADER};

  ${(p) => {
    switch (p.$tone) {
      case "success":
        return css`
          background-color: ${COLORS.STATUS_PRESENT_BG};
          color: ${COLORS.STATUS_PRESENT_TEXT};
          border-color: rgba(22, 163, 74, 0.3);
        `;
      case "warning":
        return css`
          background-color: ${COLORS.STATUS_LATE_BG};
          color: ${COLORS.STATUS_LATE_TEXT};
          border-color: rgba(217, 119, 6, 0.3);
        `;
      case "danger":
        return css`
          background-color: ${COLORS.STATUS_ABSENT_BG};
          color: ${COLORS.STATUS_ABSENT_TEXT};
          border-color: rgba(220, 38, 38, 0.3);
        `;
      case "info":
        return css`
          background-color: ${COLORS.STATUS_EXCUSED_BG};
          color: ${COLORS.STATUS_EXCUSED_TEXT};
          border-color: rgba(79, 70, 229, 0.3);
        `;
      default:
        return null;
    }
  }}
`;

export const StatusPill = Pill;

export const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

export const SuccessText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.SUCCESS};
`;
