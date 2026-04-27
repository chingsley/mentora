"use client";

import Image from "next/image";
import Link from "next/link";
import type { DayOfWeek } from "@prisma/client";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { DAY_LABEL, formatPrice } from "@/lib/time";

export interface TeacherCardProps {
  id: string;
  displayId?: string | null;
  name: string;
  headline: string;
  image?: string | null;
  rating: number;
  ratingsCount: number;
  subjectNames: string[];
  regionCode?: string | null;
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
  border-radius: ${LAYOUT.RADIUS.XL};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.FIVE};
  box-shadow: ${LAYOUT.SHADOW.SM};
  outline: 1px solid ${COLORS.RING_BLACK_5};
  outline-offset: -1px;
  transition: outline 0.15s ease, box-shadow 0.15s ease;
  text-decoration: none;
  color: inherit;

  &:hover {
    outline-color: rgba(23, 32, 51, 0.2);
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

const Avatar = styled.div`
  position: relative;
  height: 3.5rem;
  width: 3.5rem;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.MUTED};
  outline: 1px solid ${COLORS.BORDER};
  outline-offset: -1px;
`;

const AvatarFallback = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const TitleRow = styled.div`
  min-width: 0;
  flex: 1;
`;

const TitleLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.TWO};
`;

const Name = styled.h3`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${FONTS.SIZE.BASE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const RatingBadge = styled.span`
  flex-shrink: 0;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: rgba(23, 32, 51, 0.05);
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const RatingCount = styled.span`
  margin-left: ${SPACING.ONE};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Headline = styled.p`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const DisplayId = styled.p`
  margin-top: 0.125rem;
  font-family: ${FONTS.FAMILY.MONO};
  font-size: 0.6875rem;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Subjects = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const SubjectPill = styled.span<{ $muted?: boolean }>`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  padding: 0.125rem 0.625rem;
  font-size: ${FONTS.SIZE.XS};
  color: ${(p) => (p.$muted ? COLORS.MUTED_FOREGROUND : "rgba(2, 8, 23, 0.8)")};
`;

const DayRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.ONE};
`;

const DayLabel = styled.span`
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const DayPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export function TeacherCard({
  id,
  displayId,
  name,
  headline,
  image,
  rating,
  ratingsCount,
  subjectNames,
  regionCode,
  minRate,
  daysTaught,
}: TeacherCardProps) {
  const uniqueDays = daysTaught ? [...new Set(daysTaught)] : [];
  const visibleSubjects = subjectNames.slice(0, 3);
  const extraSubjects = subjectNames.length - visibleSubjects.length;

  return (
    <Card href={`/teachers/${id}`}>
      <Top>
        <Avatar>
          {image ? (
            <Image
              src={image}
              alt={`${name} profile photo`}
              fill
              sizes="56px"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <AvatarFallback>{INITIALS(name)}</AvatarFallback>
          )}
        </Avatar>
        <TitleRow>
          <TitleLine>
            <Name>{name}</Name>
            <RatingBadge>
              <span aria-hidden>★</span> {rating.toFixed(1)}
              <RatingCount>({ratingsCount})</RatingCount>
            </RatingBadge>
          </TitleLine>
          <Headline>{headline}</Headline>
          {displayId ? <DisplayId>{displayId}</DisplayId> : null}
        </TitleRow>
      </Top>

      <Subjects>
        {visibleSubjects.map((s) => (
          <SubjectPill key={s}>{s}</SubjectPill>
        ))}
        {extraSubjects > 0 ? <SubjectPill $muted>+{extraSubjects} more</SubjectPill> : null}
      </Subjects>

      {uniqueDays.length > 0 ? (
        <DayRow>
          <DayLabel>Teaches</DayLabel>
          {uniqueDays.map((d) => (
            <DayPill key={d} title={DAY_LABEL[d]}>
              {DAY_LABEL[d].slice(0, 3)}
            </DayPill>
          ))}
        </DayRow>
      ) : null}

      <Footer>
        <span>{regionCode ?? "Global"}</span>
        {minRate ? <span>from {formatPrice(minRate.hourlyRate, minRate.currency)}/hr</span> : null}
      </Footer>
    </Card>
  );
}
