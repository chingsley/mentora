"use client";

import Image from "next/image";
import Link from "next/link";
import type { DayOfWeek } from "@prisma/client";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_THEME } from "@/constants/iconTheme.constants";
import { SPACING } from "@/constants/spacing.constants";
import { formatSubjectShortLabel } from "@/lib/subjectShortLabel";
import { DAY_LABEL, formatPrice } from "@/lib/time";

export interface TeacherCardProps {
  id: string;
  displayId?: string | null;
  name: string;
  image?: string | null;
  rating: number;
  ratingsCount: number;
  subjectNames: string[];
  minRate?: { hourlyRate: number; currency: string } | null;
  daysTaught?: DayOfWeek[];
}

const INITIALS = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join("").toUpperCase() || "?";
};

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  border-radius: ${DASHBOARD.CARD_RADIUS};
  background-color: ${DASHBOARD.CARD_BACKGROUND};
  padding: ${SPACING.FIVE};
  box-shadow: ${DASHBOARD.CARD_SHADOW};
  border: 1px solid ${DASHBOARD.CARD_BORDER};
  text-decoration: none;
  color: inherit;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    background-color: ${DASHBOARD.ROW_HOVER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.RING};
    outline-offset: 2px;
  }
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${SPACING.THREE};
`;

const TitleRow = styled.div`
  min-width: 0;
  flex: 1;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
`;

const TitleLine = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${SPACING.TWO};
`;

const Name = styled.h3`
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const RatingBadge = styled.span`
  flex-shrink: 0;
  border-radius: ${ICON_THEME.METRIC_ICON_BOX_RADIUS};
  background-color: ${DASHBOARD.ICON_TILE_BACKGROUND};
  padding: ${SPACING.HALF} ${SPACING.TWO};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.ICON_TILE_COLOR};
`;

const RatingCount = styled.span`
  margin-left: ${SPACING.ONE};
  color: ${DASHBOARD.TEXT_MUTED};
`;

const DisplayId = styled.p`
  margin: 0;
  font-family: ${FONTS.FAMILY.MONO};
  font-size: ${FONTS.SIZE.META};
  color: ${DASHBOARD.TEXT_MUTED};
`;

const Avatar = styled.div<{ $hasPhoto?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  height: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  flex-shrink: 0;
  overflow: hidden;
  border-radius: ${ICON_THEME.METRIC_ICON_BOX_RADIUS};
  background-color: ${(p) =>
    p.$hasPhoto ? COLORS.MUTED : DASHBOARD.ICON_TILE_BACKGROUND};
  outline: ${(p) => (p.$hasPhoto ? `1px solid ${DASHBOARD.CARD_BORDER}` : "none")};
  outline-offset: -1px;
`;

const AvatarFallback = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${DASHBOARD.ICON_TILE_COLOR};
`;

const Subjects = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.ONE};
  margin-top: ${SPACING.TWO};
`;

const SubjectPill = styled.span<{ $muted?: boolean }>`
  border-radius: ${DASHBOARD.CHIP_RADIUS};
  border: 1px solid ${DASHBOARD.CARD_BORDER};
  padding: ${SPACING.HALF} ${SPACING.TWO};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${(p) => (p.$muted ? DASHBOARD.TEXT_MUTED : DASHBOARD.TEXT_PRIMARY)};
`;

const DayRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.ONE};
`;

const DayPill = styled.span`
  border-radius: ${DASHBOARD.CHIP_RADIUS};
  background-color: ${DASHBOARD.ROW_HOVER};
  padding: ${SPACING.HALF} ${SPACING.TWO};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const Footer = styled.p`
  margin: 0;
  margin-top: ${SPACING.TWO};
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${DASHBOARD.LINK_COLOR};
`;

export function TeacherCard({
  id,
  displayId,
  name,
  image,
  rating,
  ratingsCount,
  subjectNames,
  minRate,
  daysTaught,
}: TeacherCardProps) {
  const uniqueDays = daysTaught ? [...new Set(daysTaught)] : [];
  const visibleSubjects = subjectNames.slice(0, 3);
  const extraSubjects = subjectNames.length - visibleSubjects.length;

  return (
    <Card href={`/teachers/${id}`}>
      <Top>
        <Avatar $hasPhoto={Boolean(image)}>
          {image ? (
            <Image
              src={image}
              alt={`${name} profile photo`}
              fill
              sizes={ICON_THEME.METRIC_ICON_BOX_SIZE}
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <AvatarFallback>{INITIALS(name)}</AvatarFallback>
          )}
        </Avatar>
        <TitleRow>
          <TitleBlock>
            <TitleLine>
              <Name>{name}</Name>
              <RatingBadge>
                <span aria-hidden>★</span> {rating.toFixed(1)}
                <RatingCount>({ratingsCount})</RatingCount>
              </RatingBadge>
            </TitleLine>
            {displayId ? <DisplayId>{displayId}</DisplayId> : null}
          </TitleBlock>
        </TitleRow>
      </Top>

      <Subjects>
        {visibleSubjects.map((s) => (
          <SubjectPill key={s} title={s}>
            {formatSubjectShortLabel(s)}
          </SubjectPill>
        ))}
        {extraSubjects > 0 ? (
          <SubjectPill $muted title={`${extraSubjects} more subjects`}>
            +{extraSubjects} more
          </SubjectPill>
        ) : null}
      </Subjects>

      {uniqueDays.length > 0 ? (
        <DayRow>
          {uniqueDays.map((d) => (
            <DayPill key={d} title={DAY_LABEL[d]}>
              {DAY_LABEL[d].slice(0, 3)}
            </DayPill>
          ))}
        </DayRow>
      ) : null}

      {minRate ? (
        <Footer>
          From {formatPrice(minRate.hourlyRate, minRate.currency)}/hr
        </Footer>
      ) : null}
    </Card>
  );
}
