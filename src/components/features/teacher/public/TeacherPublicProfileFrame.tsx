"use client";

import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  TEACHER_PUBLIC_PROFILE,
  TEACHER_PUBLIC_PROFILE_HERO_SURFACE,
  TEACHER_PUBLIC_PROFILE_SPACE,
} from "@/constants/teacherPublicProfile.constants";

/** Full-bleed public profile chrome (hero band + tab bar + body). */
export const PublicProfileBleed = styled.div<{ $flushToMainTop?: boolean }>`
  margin-left: calc(-1 * ${LAYOUT.PAGE_INSET.INLINE});
  margin-right: calc(-1 * ${LAYOUT.PAGE_INSET.INLINE});
  width: calc(100% + 2 * ${LAYOUT.PAGE_INSET.INLINE});

  ${(p) =>
    p.$flushToMainTop &&
    css`
      margin-top: calc(-1 * ${LAYOUT.PAGE_INSET.BLOCK});
    `}
`;

/** Grey wash behind hero and profile section tabs (mockup). */
export const PublicProfileChrome = styled.div<{ $flushToMainTop?: boolean }>`
  background-color: ${TEACHER_PUBLIC_PROFILE_HERO_SURFACE};

  ${(p) =>
    p.$flushToMainTop &&
    css`
      padding-top: ${LAYOUT.PAGE_INSET.BLOCK};
    `}
`;

export const PublicProfileColumn = styled.div`
  margin: 0 auto;
  max-width: ${TEACHER_PUBLIC_PROFILE.CONTENT_MAX_WIDTH};
  width: 100%;
`;

export const PublicProfileHeroBand = styled.div<{ $profilePreview?: boolean }>`
  padding: ${(p) =>
    p.$profilePreview
      ? `0 ${LAYOUT.PAGE_INSET.INLINE} ${SPACING.FOUR}`
      : `${TEACHER_PUBLIC_PROFILE_SPACE.HERO_PADDING_BLOCK} ${LAYOUT.PAGE_INSET.INLINE} 0`};
`;

export const PublicProfileTabRegion = styled.div`
  border-bottom: 1px solid ${COLORS.BORDER};
  padding: 0 ${LAYOUT.PAGE_INSET.INLINE};
`;

export const PublicProfileBodyRegion = styled.div`
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${LAYOUT.PAGE_INSET.INLINE} ${TEACHER_PUBLIC_PROFILE_SPACE.BODY_PADDING_BLOCK};
`;
