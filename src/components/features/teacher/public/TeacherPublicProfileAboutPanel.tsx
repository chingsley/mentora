"use client";

import type { ReactNode } from "react";
import * as React from "react";
import styled from "styled-components";
import { TeacherProfileContactDetailsView } from "@/components/features/teacher/profile/TeacherProfileContactDetailsView";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  TEACHER_PUBLIC_PROFILE,
  TEACHER_PUBLIC_PROFILE_SPACE,
} from "@/constants/teacherPublicProfile.constants";

export interface TeacherPublicProfileAboutPanelProps {
  bio: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  bioEditor?: ReactNode;
  contactEditor?: ReactNode;
}

const Grid = styled.div`
  display: grid;
  gap: ${TEACHER_PUBLIC_PROFILE_SPACE.CONTENT_COLUMNS_GAP};
  padding-top: ${SPACING.EIGHT};

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: minmax(0, 1fr) minmax(16rem, 20rem);
    align-items: start;
    column-gap: ${SPACING.TWELVE};
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 ${SPACING.FIVE};
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${COLORS.HEADER};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
`;

const BioText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.GRAY_TEXT_SECONDARY};
  white-space: pre-wrap;
`;

const SeeMoreButton = styled.button`
  margin-top: ${SPACING.FOUR};
  padding: 0;
  border: none;
  background: none;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.GRAY_TEXT_TERTIARY};
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: ${COLORS.HEADER};
  }
`;

const SideStack = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export function TeacherPublicProfileAboutPanel({
  bio,
  email,
  phone,
  address,
  bioEditor,
  contactEditor,
}: TeacherPublicProfileAboutPanelProps) {
  const [expanded, setExpanded] = React.useState(false);
  const text = bio.trim() || "This teacher hasn't written a bio yet.";
  const truncated =
    text.length > TEACHER_PUBLIC_PROFILE.ABOUT_TRUNCATE_CHARS && !expanded;
  const visible = truncated
    ? `${text.slice(0, TEACHER_PUBLIC_PROFILE.ABOUT_TRUNCATE_CHARS).trim()}…`
    : text;

  return (
    <Grid>
      <section aria-labelledby="teacher-about-me">
        <SectionTitle id="teacher-about-me">About Me</SectionTitle>
        {bioEditor ? (
          bioEditor
        ) : (
          <>
            <BioText>{visible}</BioText>
            {text.length > TEACHER_PUBLIC_PROFILE.ABOUT_TRUNCATE_CHARS ? (
              <SeeMoreButton type="button" onClick={() => setExpanded((v) => !v)}>
                {expanded ? "See less" : "See more"}
              </SeeMoreButton>
            ) : null}
          </>
        )}
      </section>

      <SideStack aria-labelledby="teacher-contact">
        <SectionTitle id="teacher-contact">Contact Details</SectionTitle>
        {contactEditor ?? (
          <TeacherProfileContactDetailsView email={email} phone={phone} address={address} />
        )}
      </SideStack>
    </Grid>
  );
}
