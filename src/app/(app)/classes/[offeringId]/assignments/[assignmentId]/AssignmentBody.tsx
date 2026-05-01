"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export const Description = styled.p`
  white-space: pre-wrap;
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

export const MutedText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export const AttachmentLink = styled.a`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const ContentStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

export const ContentStackLg = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

export const SubmissionBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.THREE};
`;

export const Top = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

export const InlineLink = styled.a`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  text-decoration: underline;
`;

export const Submitted = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export const GradeStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
`;

export const GradeText = styled.p`
  font-size: ${FONTS.SIZE.SM};
`;

export const GradeStrong = styled.strong`
  color: ${COLORS.HEADER};
`;

export const Feedback = styled.p`
  white-space: pre-wrap;
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;
