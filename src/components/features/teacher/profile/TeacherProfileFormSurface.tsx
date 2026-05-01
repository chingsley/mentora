"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { BOX_SHADOW_CARD, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

/** Horizontal / top padding for profile tab form shells (bio, courses, etc.). */
export const TEACHER_PROFILE_FORM_SURFACE_PADDING = SPACING.SIX;

/** Extra space below the last block before the card bottom edge. */
export const TEACHER_PROFILE_FORM_SURFACE_PADDING_BOTTOM = SPACING.TEN;

/**
 * Shared chrome for teacher profile tab forms — matches the merged bio card surface
 * (border, radius, shadow, max-width, container query).
 */
export const TeacherProfileFormSurface = styled.div`
  container-type: inline-size;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  margin-inline: 0;
  padding: ${TEACHER_PROFILE_FORM_SURFACE_PADDING};
  padding-bottom: ${TEACHER_PROFILE_FORM_SURFACE_PADDING_BOTTOM};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  box-shadow: ${BOX_SHADOW_CARD};
  background-color: ${COLORS.FOREGROUND};

  ${LAYOUT.MEDIA.SM} {
    max-width: ${LAYOUT.MAX_WIDTH.TEACHER_PROFILE_BIO_FORM};
    margin-inline: auto;
  }
`;
