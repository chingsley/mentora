"use client";

import Image from "next/image";
import styled from "styled-components";
import { ProfileCompletenessBar } from "@/components/features/teacher/ProfileCompletenessBar";
import { Card } from "@/components/ui/Card";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherProfileChecklistItem } from "./TeacherProfileTabs.types";

const HeroCard = styled(Card)`
  overflow: hidden;
`;

const HeroRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
  }
`;

const Avatar = styled.div`
  position: relative;
  height: 6rem;
  width: 6rem;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.MUTED};
  outline: 2px solid rgba(23, 32, 51, 0.1);
  outline-offset: -2px;

  ${LAYOUT.MEDIA.SM} {
    height: 7rem;
    width: 7rem;
  }
`;

const AvatarFallback = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-size: ${FONTS.SIZE["2XL"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const HeroBody = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const Name = styled.h1`
  font-size: ${FONTS.SIZE["2XL"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE["3XL"]};
  }
`;

const DisplayId = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem 0.625rem;
  font-family: ${FONTS.FAMILY.MONO};
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.HEADER};
`;

const StatusPill = styled.span<{ $tone: "success" | "warning" }>`
  border-radius: ${LAYOUT.RADIUS.FULL};
  padding: 0.125rem 0.625rem;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  background-color: ${(p) => (p.$tone === "success" ? "rgba(22, 163, 74, 0.1)" : "#fef3c7")};
  color: ${(p) => (p.$tone === "success" ? COLORS.SUCCESS : "#78350f")};
`;

const Headline = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const KpiRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.FOUR};
  padding-top: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
`;

const RatingBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.ONE} ${SPACING.TWO};
  color: ${COLORS.HEADER};
`;

const RatingValue = styled.span`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
`;

const RatingCount = styled.span`
  color: ${COLORS.MUTED_FOREGROUND};
`;

const KpiBox = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
`;

const KpiValue = styled.span`
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const KpiLabel = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const CompletenessWrap = styled.div`
  margin-top: ${SPACING.FIVE};
`;

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <KpiBox>
      <KpiValue>{value}</KpiValue>
      <KpiLabel>{label}</KpiLabel>
    </KpiBox>
  );
}

export interface TeacherProfileHeroProps {
  fullName: string;
  initials: string;
  imageUrl: string | null;
  displayId: string;
  profileCompleted: boolean;
  headline: string;
  bio: string;
  rating: number;
  ratingsCount: number;
  hoursTaught: number;
  offeringCount: number;
  activeStudentCount: number;
  checklist: TeacherProfileChecklistItem[];
  onNavigateTab?: (tab: string) => void;
}

const PROFILE_HERO_BIO_TAGLINE_MAX_CHARS = 160;

function profileTagline(headline: string, bio: string): string {
  const trimmedHeadline = headline.trim();
  if (trimmedHeadline) return trimmedHeadline;
  const collapsed = bio.trim().replace(/\s+/g, " ");
  if (collapsed)
    return collapsed.length > PROFILE_HERO_BIO_TAGLINE_MAX_CHARS
      ? `${collapsed.slice(0, PROFILE_HERO_BIO_TAGLINE_MAX_CHARS)}…`
      : collapsed;
  return "Add your bio in the Photo & bio tab.";
}

export function TeacherProfileHero({
  fullName,
  initials,
  imageUrl,
  displayId,
  profileCompleted,
  headline,
  bio,
  rating,
  ratingsCount,
  hoursTaught,
  offeringCount,
  activeStudentCount,
  checklist,
  onNavigateTab,
}: TeacherProfileHeroProps) {
  return (
    <HeroCard>
      <HeroRow>
        <Avatar>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${fullName} profile photo`}
              fill
              sizes="112px"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <HeroBody>
          <TitleRow>
            <Name>{fullName}</Name>
            <DisplayId>{displayId}</DisplayId>
            {profileCompleted ? (
              <StatusPill $tone="success">Profile complete</StatusPill>
            ) : (
              <StatusPill $tone="warning">Profile in setup</StatusPill>
            )}
          </TitleRow>
          <Headline>{profileTagline(headline, bio)}</Headline>
          <KpiRow>
            <RatingBadge>
              <span aria-hidden>★</span>
              <RatingValue>{rating.toFixed(1)}</RatingValue>
              <RatingCount>({ratingsCount})</RatingCount>
            </RatingBadge>
            <Kpi label="Hours taught" value={hoursTaught.toString()} />
            <Kpi label="Active periods" value={offeringCount.toString()} />
            <Kpi label="Active students" value={activeStudentCount.toString()} />
          </KpiRow>
        </HeroBody>
      </HeroRow>
      <CompletenessWrap>
        <ProfileCompletenessBar items={checklist} onNavigateTab={onNavigateTab} />
      </CompletenessWrap>
    </HeroCard>
  );
}
