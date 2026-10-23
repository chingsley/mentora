"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

/** Shared bordered card for profile view/edit blocks (bio, hero summary). */
export const TeacherProfileViewEditCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  width: 100%;
  min-width: 0;
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
`;

export const TeacherProfileViewEditCardFooter = styled.div<{ $alignStart?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  justify-content: ${({ $alignStart }) => ($alignStart ? "flex-start" : "flex-end")};
  gap: ${SPACING.TWO};
`;
