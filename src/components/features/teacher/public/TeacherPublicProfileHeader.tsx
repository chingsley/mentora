"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { MessageCircle, TrendingUp, Trophy } from "lucide-react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import {
  TEACHER_PUBLIC_PROFILE,
  TEACHER_PUBLIC_PROFILE_NATIVE_BADGE,
  TEACHER_PUBLIC_PROFILE_SPACE,
} from "@/constants/teacherPublicProfile.constants";
import { SPACING } from "@/constants/spacing.constants";
import { countryCodeToFlagEmoji } from "@/lib/countryCodeToFlagEmoji";
import { parseSpokenLanguages } from "@/lib/parseSpokenLanguages";

export interface TeacherPublicProfileHeaderProps {
  name: string;
  imageUrl: string | null;
  initials: string;
  /** Replaces the read-only avatar (teacher profile preview). */
  photoEditor?: ReactNode;
  headline: string;
  spokenLanguages: string;
  locationCountryCode: string;
  displayId: string;
  rating: number;
  ratingsCount: number;
  primarySubjectName: string;
}

const Hero = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${TEACHER_PUBLIC_PROFILE_SPACE.HERO_GAP};

  ${LAYOUT.MEDIA.MD} {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const Avatar = styled.div`
  position: relative;
  width: 100%;
  max-width: ${TEACHER_PUBLIC_PROFILE.HERO_AVATAR_SIZE};
  aspect-ratio: 1;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: ${TEACHER_PUBLIC_PROFILE.HERO_AVATAR_RADIUS};
  background-color: ${COLORS.MUTED};
  box-shadow: ${TEACHER_PUBLIC_PROFILE.HERO_AVATAR_SHADOW};
`;

const AvatarFallback = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-size: ${FONTS.SIZE.STAT_VALUE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Body = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: ${SPACING.THREE};
  padding-top: ${SPACING.TWO};

  ${LAYOUT.MEDIA.MD} {
    padding-top: ${SPACING.FOUR};
  }
`;

const RankLine = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.GRAY_TEXT_TERTIARY};
`;

const NameRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const Name = styled.h1`
  margin: 0;
  font-size: ${FONTS.SIZE.PAGE_HEADER};
  font-weight: ${FONTS.WEIGHT.BOLD};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${COLORS.HEADER};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
`;

const Flag = styled.span`
  font-size: ${FONTS.SIZE.LG};
  line-height: 1;
`;

const Headline = styled.p`
  margin: 0;
  max-width: 36rem;
  font-size: ${FONTS.SIZE.MD};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.GRAY_TEXT_SECONDARY};
`;

const LanguagesRow = styled.p`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.GRAY_TEXT_SECONDARY};
`;

const NativeBadge = styled.span`
  display: inline-block;
  margin: 0 ${SPACING.HALF};
  border-radius: ${LAYOUT.RADIUS.SM};
  background-color: ${TEACHER_PUBLIC_PROFILE_NATIVE_BADGE.BACKGROUND};
  padding: ${SPACING.HALF} ${SPACING.TWO};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${TEACHER_PUBLIC_PROFILE_NATIVE_BADGE.TEXT};
  vertical-align: middle;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${TEACHER_PUBLIC_PROFILE_SPACE.BADGE_GAP};
  margin-top: ${SPACING.TWO};
`;

const BadgeCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  min-width: 0;
  flex: 1 1 15rem;
  max-width: 22rem;
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER_SUBTLE_LIGHT};
  background-color: ${COLORS.FOREGROUND};
  box-shadow: ${LAYOUT.SHADOW.SM};
`;

const BadgeIcon = styled.span<{ $tone: "success" | "accent" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${(p) =>
    p.$tone === "success" ? COLORS.ACTION_PRIMARY_TINT_16 : COLORS.DESTRUCTIVE_TINT_10};
  color: ${(p) => (p.$tone === "success" ? COLORS.ACTION_PRIMARY : COLORS.DESTRUCTIVE)};
`;

const BadgeText = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: ${SPACING.HALF};
`;

const BadgeTitle = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.HEADER};
`;

const BadgeMeta = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${COLORS.GRAY_TEXT_TERTIARY};
`;

export function TeacherPublicProfileHeader({
  name,
  imageUrl,
  initials,
  photoEditor,
  headline,
  spokenLanguages,
  locationCountryCode,
  displayId,
  rating,
  ratingsCount,
  primarySubjectName,
}: TeacherPublicProfileHeaderProps) {
  const languages = parseSpokenLanguages(spokenLanguages);
  const flag = countryCodeToFlagEmoji(locationCountryCode);
  const showSuperTutor = rating >= 4.5 && ratingsCount >= 3;
  const showTopTutor = rating >= 4.7 && ratingsCount >= 5;
  const subjectLabel = primarySubjectName.trim()
    ? `${primarySubjectName.toUpperCase()} TUTOR`
    : "TUTOR";

  return (
    <Hero>
      {photoEditor ? (
        photoEditor
      ) : (
        <Avatar>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${name} profile photo`}
              fill
              sizes={TEACHER_PUBLIC_PROFILE.HERO_AVATAR_SIZE}
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
      )}

      <Body>
        {displayId ? <RankLine>{displayId}</RankLine> : null}
        <NameRow>
          <Name>{name}</Name>
          {flag ? <Flag aria-hidden>{flag}</Flag> : null}
        </NameRow>
        <Headline>{headline || "Tutor on Mentora"}</Headline>

        {languages.length > 0 ? (
          <LanguagesRow>
            <MessageCircle
              size={ICON_SIZE.SM}
              strokeWidth={ICON_STROKE.NORMAL}
              color={COLORS.GRAY_TEXT_TERTIARY}
              aria-hidden
            />
            <span>
              Speaks:{" "}
              {languages.map((lang, index) => (
                <span key={lang}>
                  {index === 0 ? (
                    <>
                      {lang}
                      <NativeBadge>Native</NativeBadge>
                    </>
                  ) : (
                    lang
                  )}
                  {index < languages.length - 1 ? ", " : ""}
                </span>
              ))}
            </span>
          </LanguagesRow>
        ) : null}

        <BadgeRow>
          {showSuperTutor ? (
            <BadgeCard>
              <BadgeIcon $tone="success" aria-hidden>
                <Trophy size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
              </BadgeIcon>
              <BadgeText>
                <BadgeTitle>A highly rated and experienced tutor</BadgeTitle>
                <BadgeMeta>Super tutor</BadgeMeta>
              </BadgeText>
            </BadgeCard>
          ) : null}
          {showTopTutor ? (
            <BadgeCard>
              <BadgeIcon $tone="accent" aria-hidden>
                <TrendingUp size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
              </BadgeIcon>
              <BadgeText>
                <BadgeTitle>Top 1%</BadgeTitle>
                <BadgeMeta>{subjectLabel}</BadgeMeta>
              </BadgeText>
            </BadgeCard>
          ) : null}
        </BadgeRow>
      </Body>
    </Hero>
  );
}
