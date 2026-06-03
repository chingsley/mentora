"use client";

import Image from "next/image";
import * as React from "react";
import styled from "styled-components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import type { CalendarEntry } from "@/components/features/calendar/types";
import type { ClassDetail } from "@/components/features/class/ClassDetailsDialog";
import type { Role } from "@prisma/client";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TeacherPublicCalendar } from "./TeacherPublicCalendar";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

const HeroCard = styled(Card)`
  overflow: hidden;
`;

const HeroInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
`;

const HeroRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};

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

const RatingPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: rgba(23, 32, 51, 0.05);
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const RatingCount = styled.span`
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Headline = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const PriceLine = styled.p`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const SubjectPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding-top: ${SPACING.ONE};
`;

const SubjectPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  padding: 0.125rem 0.625rem;
  font-size: ${FONTS.SIZE.XS};
  color: rgba(2, 8, 23, 0.8);
`;

const InfoBlock = styled.p`
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const HeroDivider = styled.hr`
  margin: 0;
  border: none;
  border-top: 1px solid ${COLORS.BORDER_SUBTLE_LIGHT};
`;

const AboutSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  max-width: 42rem;
`;

const AboutLabel = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${COLORS.SIDEBAR_MUTED};
`;

const AboutText = styled.p`
  margin: 0;
  white-space: pre-wrap;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.SIDEBAR_MUTED};
`;

const RatesGrid = styled.ul`
  display: grid;
  gap: ${SPACING.THREE};
  list-style: none;
  margin: 0;
  padding: 0;
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const RateItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER_SUBTLE_LIGHT};
  padding: ${SPACING.FOUR};
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: ${COLORS.BORDER};
    box-shadow: ${LAYOUT.SHADOW.SM};
  }
`;

const RateSubject = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const RateRegion = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.SIDEBAR_MUTED};
`;

const RatePrice = styled.span`
  margin-top: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  letter-spacing: -0.01em;
`;

const RatePriceUnit = styled.span`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.SIDEBAR_MUTED};
`;

const Muted = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const TestimonialGrid = styled.ul`
  display: grid;
  gap: ${SPACING.THREE};
  list-style: none;
  margin: 0;
  padding: 0;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const TestimonialCard = styled.li`
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.THREE};
`;

const TestimonialHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TestimonialName = styled.p`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Stars = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: #b45309;
`;

const StarsMuted = styled.span`
  color: ${COLORS.MUTED_FOREGROUND};
`;

const TestimonialBody = styled.p`
  margin-top: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

const TestimonialFoot = styled.p`
  margin-top: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.META};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface TeacherTestimonial {
  id: string;
  studentName: string;
  rating: number;
  body: string;
  offeringTitle: string;
}

export interface TeacherRateRow {
  id: string;
  subjectName: string;
  regionName: string;
  hourlyDisplay: string;
}

export interface TeacherDetailViewProps {
  name: string;
  imageUrl: string | null;
  initials: string;
  displayId: string;
  rating: number;
  ratingsCount: number;
  headline: string;
  bio: string;
  priceSummary: string;
  subjects: { id: string; name: string; }[];
  rates: TeacherRateRow[];
  entries: CalendarEntry[];
  detailsByOfferingId: Record<string, ClassDetail>;
  enrollmentByOfferingId: Record<string, string>;
  viewerRole: Role;
  viewerName: string | null;
  testimonials: TeacherTestimonial[];
}

export function TeacherDetailView({
  name,
  imageUrl,
  initials,
  displayId,
  rating,
  ratingsCount,
  headline,
  bio,
  priceSummary,
  subjects,
  rates,
  entries,
  detailsByOfferingId,
  enrollmentByOfferingId,
  viewerRole,
  viewerName,
  testimonials,
}: TeacherDetailViewProps) {
  return (
    <Wrap>
      <HeroCard>
        <HeroInner>
          <HeroRow>
            <Avatar>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`${name} profile photo`}
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
                <Name>{name}</Name>
                <DisplayId>{displayId}</DisplayId>
                <RatingPill>
                  <span aria-hidden>★</span>
                  {rating.toFixed(1)}
                  <RatingCount>({ratingsCount})</RatingCount>
                </RatingPill>
              </TitleRow>
              <Headline>{headline || "Tutor on Mentora"}</Headline>
              <PriceLine>{priceSummary}</PriceLine>
              <SubjectPills>
                {subjects.map((s) => (
                  <SubjectPill key={s.id}>{s.name}</SubjectPill>
                ))}
              </SubjectPills>
            </HeroBody>
          </HeroRow>

          <HeroDivider />

          <AboutSection aria-labelledby="teacher-about-heading">
            <AboutLabel id="teacher-about-heading">About</AboutLabel>
            <AboutText>{bio || "This teacher hasn't written a bio yet."}</AboutText>
          </AboutSection>
        </HeroInner>
      </HeroCard>

      <Card>
        <CardHeader>
          <CardTitle>Rates</CardTitle>
          <CardDescription>Hourly rates by subject and region.</CardDescription>
        </CardHeader>
        <CardContent>
          {rates.length === 0 ? (
            <Muted>No rates set yet.</Muted>
          ) : (
            <RatesGrid>
              {rates.map((r) => (
                <RateItem key={r.id}>
                  <RateSubject>{r.subjectName}</RateSubject>
                  <RateRegion>{r.regionName}</RateRegion>
                  <RatePrice>
                    {r.hourlyDisplay}
                    <RatePriceUnit> /hr</RatePriceUnit>
                  </RatePrice>
                </RateItem>
              ))}
            </RatesGrid>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
          <CardDescription>
            Tap a class to see capacity, rules and testimonies. Green tiles
            are open, amber are almost full, red are full.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <InfoBlock>
              This teacher hasn&apos;t published any class periods yet.
            </InfoBlock>
          ) : (
            <TeacherPublicCalendar
              entries={entries}
              detailsByOfferingId={detailsByOfferingId}
              enrollmentByOfferingId={enrollmentByOfferingId}
              viewerRole={viewerRole}
              viewerName={viewerName}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>
            What previous students said about classes with {name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testimonials.length === 0 ? (
            <Muted>No testimonials yet.</Muted>
          ) : (
            <TestimonialGrid>
              {testimonials.slice(0, 6).map((t) => (
                <TestimonialCard key={t.id}>
                  <TestimonialHead>
                    <TestimonialName>{t.studentName}</TestimonialName>
                    <Stars aria-label={`${t.rating} out of 5`}>
                      {"★".repeat(t.rating)}
                      <StarsMuted>{"★".repeat(5 - t.rating)}</StarsMuted>
                    </Stars>
                  </TestimonialHead>
                  <TestimonialBody>{t.body}</TestimonialBody>
                  <TestimonialFoot>{t.offeringTitle}</TestimonialFoot>
                </TestimonialCard>
              ))}
            </TestimonialGrid>
          )}
        </CardContent>
      </Card>
    </Wrap>
  );
}
