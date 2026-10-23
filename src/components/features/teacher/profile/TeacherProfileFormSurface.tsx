"use client";

import * as React from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { BOX_SHADOW_CARD, LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { useTeacherProfileSetupMode } from "./TeacherProfileSetupContext";

/** Horizontal / top padding for profile tab form shells (bio, courses, etc.). */
export const TEACHER_PROFILE_FORM_SURFACE_PADDING = SPACING.SIX;

/** Extra space below the last block before the card bottom edge. */
export const TEACHER_PROFILE_FORM_SURFACE_PADDING_BOTTOM = SPACING.TEN;

export type TeacherProfileFormContentInset = "default" | "compactTop";

const profileFormSurfaceStyles = css<{
  $setup?: boolean;
  $contentInset?: TeacherProfileFormContentInset;
}>`
  container-type: inline-size;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  margin-inline: 0;

  ${({ $setup, $contentInset }) =>
    $setup
      ? css`
          padding: 0;
          padding-bottom: ${SPACING.EIGHT};
          border: none;
          box-shadow: none;
          background-color: ${COLORS.TRANSPARENT};
        `
      : css`
          padding: ${TEACHER_PROFILE_FORM_SURFACE_PADDING};
          padding-top: ${$contentInset === "compactTop"
            ? SPACING.TWO
            : TEACHER_PROFILE_FORM_SURFACE_PADDING};
          padding-bottom: ${TEACHER_PROFILE_FORM_SURFACE_PADDING_BOTTOM};
          border-radius: ${LAYOUT.RADIUS.LG};
          border: 1px solid ${COLORS.BORDER};
          box-shadow: ${BOX_SHADOW_CARD};
          background-color: ${COLORS.FOREGROUND};

          ${LAYOUT.MEDIA.SM} {
            max-width: ${LAYOUT.MAX_WIDTH.TEACHER_PROFILE_BIO_FORM};
            margin-inline: auto;
          }
        `}
`;

const StyledTeacherProfileFormSurface = styled.div<{
  $setup?: boolean;
  $contentInset?: TeacherProfileFormContentInset;
}>`
  ${profileFormSurfaceStyles}
`;

const StyledTeacherProfileForm = styled.form<{
  $setup?: boolean;
  $contentInset?: TeacherProfileFormContentInset;
}>`
  ${profileFormSurfaceStyles}
`;

/**
 * Shared chrome for teacher profile tab forms — matches the merged bio card surface
 * (border, radius, shadow, max-width, container query). Borderless in onboarding setup mode.
 */
export interface TeacherProfileFormSurfaceProps
  extends React.ComponentPropsWithoutRef<typeof StyledTeacherProfileFormSurface> {
  contentInset?: TeacherProfileFormContentInset;
}

export function TeacherProfileFormSurface({
  contentInset = "default",
  ...props
}: TeacherProfileFormSurfaceProps) {
  const setupMode = useTeacherProfileSetupMode();
  return (
    <StyledTeacherProfileFormSurface $setup={setupMode} $contentInset={contentInset} {...props} />
  );
}

export interface TeacherProfileFormProps
  extends React.ComponentPropsWithoutRef<typeof StyledTeacherProfileForm> {
  contentInset?: TeacherProfileFormContentInset;
}

/** Same chrome as {@link TeacherProfileFormSurface}, as a `<form>` for tab save actions. */
export function TeacherProfileForm({
  contentInset = "default",
  ...props
}: TeacherProfileFormProps) {
  const setupMode = useTeacherProfileSetupMode();
  return <StyledTeacherProfileForm $setup={setupMode} $contentInset={contentInset} {...props} />;
}
