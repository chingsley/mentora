"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export const TeachersSectionHeading = styled.h2`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${COLORS.MUTED_FOREGROUND};
`;

export const TeachersResults = styled.div`
  display: grid;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const TeachersEmpty = styled.p`
  border-radius: ${LAYOUT.RADIUS.XL};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.EIGHT};
  text-align: center;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  outline: 1px solid ${COLORS.RING_BLACK_5};
  outline-offset: -1px;
`;
