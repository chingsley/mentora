"use client";

import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { LAYOUT } from "@/constants/layout.constants";
import {
  TEACHER_PUBLIC_PROFILE,
  TEACHER_PUBLIC_PROFILE_HERO_SURFACE,
  TEACHER_PUBLIC_PROFILE_SPACE,
} from "@/constants/teacherPublicProfile.constants";

/** Full-bleed public profile chrome (hero band + tab bar + body). */
export const PublicProfileBleed = styled.div<{ $profilePreview?: boolean }>`
  margin-left: calc(-1 * ${LAYOUT.PAGE_INSET.INLINE});
  margin-right: calc(-1 * ${LAYOUT.PAGE_INSET.INLINE});
  width: calc(100% + 2 * ${LAYOUT.PAGE_INSET.INLINE});

  ${(p) =>
    p.$profilePreview &&
    css`
      margin-top: calc(-1 * ${TEACHER_PUBLIC_PROFILE_SPACE.PROFILE_PREVIEW_CHROME_PULL_BLOCK});
    `}
`;

/** Grey wash behind hero + profile section tabs (mockup). */
export const PublicProfileChrome = styled.div`
  background-color: ${TEACHER_PUBLIC_PROFILE_HERO_SURFACE};
`;

export const PublicProfileColumn = styled.div`
  margin: 0 auto;
  max-width: ${TEACHER_PUBLIC_PROFILE.CONTENT_MAX_WIDTH};
  width: 100%;
`;

export const PublicProfileHeroBand = styled.div<{ $profilePreview?: boolean }>`
  padding: ${(p) =>
    p.$profilePreview
      ? `${TEACHER_PUBLIC_PROFILE_SPACE.PROFILE_PREVIEW_TITLE_PADDING_BLOCK} ${LAYOUT.PAGE_INSET.INLINE} 0`
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
