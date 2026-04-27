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
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { WardTimetable } from "./WardTimetable";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

const HeroCard = styled(Card)`
  overflow: hidden;
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

const Fallback = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-size: ${FONTS.SIZE["2XL"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Body = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.375rem;
`;

const Name = styled.h1`
  font-size: ${FONTS.SIZE["2XL"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE["3XL"]};
  }
`;

const Muted = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Soft = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

const Pills = styled.div`
  margin-top: ${SPACING.ONE};
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const Pill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  padding: 0.125rem ${SPACING.TWO};
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

export interface WardProfileViewProps {
  studentId: string;
  studentName: string;
  studentEmail: string;
  imageUrl: string | null;
  initials: string;
  enrollmentsCount: number;
  interests: { id: string; name: string }[];
  entries: CalendarEntry[];
}

export function WardProfileView({
  studentId,
  studentName,
  studentEmail,
  imageUrl,
  initials,
  enrollmentsCount,
  interests,
  entries,
}: WardProfileViewProps) {
  return (
    <Wrap>
      <HeroCard>
        <HeroRow>
          <Avatar>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${studentName} profile photo`}
                fill
                sizes="112px"
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <Fallback>{initials}</Fallback>
            )}
          </Avatar>
          <Body>
            <Name>{studentName}</Name>
            <Muted>{studentEmail}</Muted>
            <Soft>
              {enrollmentsCount} active class{enrollmentsCount === 1 ? "" : "es"}
            </Soft>
            {interests.length > 0 ? (
              <Pills>
                {interests.map((i) => (
                  <Pill key={i.id}>{i.name}</Pill>
                ))}
              </Pills>
            ) : null}
          </Body>
        </HeroRow>
      </HeroCard>

      <Card>
        <CardHeader>
          <CardTitle>Weekly timetable</CardTitle>
          <CardDescription>
            Tap a class for teacher details, attendance history, and join
            options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <InfoBlock>
              {studentName.split(" ")[0]} isn&apos;t enrolled in any active classes
              yet.
            </InfoBlock>
          ) : (
            <WardTimetable entries={entries} studentId={studentId} />
          )}
        </CardContent>
      </Card>
    </Wrap>
  );
}
