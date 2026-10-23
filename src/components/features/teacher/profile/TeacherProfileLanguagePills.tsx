"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export const TeacherProfileLanguagePillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
`;

export const TeacherProfileLanguagePill = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.ACTION_PRIMARY_TINT_16};
  padding: ${SPACING.ONE} ${SPACING.TWO};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.ACTION_PRIMARY};
`;

export interface TeacherProfileLanguagePillsProps {
  languages: string[];
}

export function TeacherProfileLanguagePills({ languages }: TeacherProfileLanguagePillsProps) {
  if (languages.length === 0) return null;
  return (
    <TeacherProfileLanguagePillRow>
      {languages.map((language) => (
        <TeacherProfileLanguagePill key={language}>{language}</TeacherProfileLanguagePill>
      ))}
    </TeacherProfileLanguagePillRow>
  );
}
