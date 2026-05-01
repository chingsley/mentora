"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import styled, { css } from "styled-components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.HALF};
`;

const BackLink = styled(Link)`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MUTED_FOREGROUND};
  text-decoration: none;

  &:hover {
    color: ${COLORS.HEADER};
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  margin-top: ${SPACING.TWO};
  font-size: ${FONTS.SIZE["2XL"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE["3XL"]};
  }
`;

const Subtitle = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ThreeCol = styled.div`
  display: grid;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const OverviewCard = styled(Card)`
  ${LAYOUT.MEDIA.LG} {
    grid-column: span 2;
  }
`;

const StatGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StatBox = styled.div`
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.TWO};
`;

const StatLabel = styled.dt`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const StatValue = styled.dd`
  margin: 0.125rem 0 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const SubSection = styled.section`
  margin-top: ${SPACING.FOUR};
`;

const SubHeading = styled.h3`
  margin-bottom: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const Description = styled.p`
  white-space: pre-wrap;
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

const RuleList = styled.ul`
  list-style: disc;
  padding-left: 1.25rem;
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);

  & > li + li {
    margin-top: ${SPACING.ONE};
  }
`;

const TeacherRow = styled.div`
  display: flex;
  align-items: center;
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
  outline: 2px solid rgba(23, 32, 51, 0.1);
  outline-offset: -2px;
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

const TeacherInfo = styled.div`
  min-width: 0;
`;

const TeacherName = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const TeacherMeta = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const TeacherActions = styled.div`
  margin-top: ${SPACING.THREE};
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.HEADER};
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.WHITE};
  text-decoration: none;

  &:hover {
    background-color: rgba(23, 32, 51, 0.9);
  }
`;

const Muted = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const AttendanceList = styled.ul`
  & > li + li {
    border-top: 1px solid ${COLORS.BORDER};
  }
`;

const AttendanceRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${SPACING.TWO} 0;
  font-size: ${FONTS.SIZE.SM};
`;

const SessionDate = styled.p`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const SessionSource = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | string;

const Badge = styled.span<{ $status: Status }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  text-transform: lowercase;

  ${({ $status }) => {
    switch ($status) {
      case "PRESENT":
        return css`
          background-color: #d1fae5;
          color: #064e3b;
          border-color: #6ee7b7;
        `;
      case "ABSENT":
        return css`
          background-color: #ffe4e6;
          color: #881337;
          border-color: #fda4af;
        `;
      case "LATE":
        return css`
          background-color: #fef3c7;
          color: #78350f;
          border-color: #fcd34d;
        `;
      case "EXCUSED":
        return css`
          background-color: #e0f2fe;
          color: #0c4a6e;
          border-color: #7dd3fc;
        `;
      default:
        return null;
    }
  }}
`;

interface AttendanceItem {
  id: string;
  sessionDate: Date;
  source: "AUTO_JOIN" | "MANUAL" | string;
  status: Status;
}

export interface WardClassDetailViewProps {
  studentId: string;
  offering: {
    title: string;
    subjectName: string;
    dayLabel: string;
    timeLabel: string;
    durationLabel: string;
    hourlyDisplay: string | null;
    classLimit: number;
    enrolledCount: number;
    description: string | null;
    rulesLines: string[];
  };
  teacher: {
    id: string;
    name: string;
    imageUrl: string | null;
    initials: string;
    avgRating: number;
    ratingsCount: number;
  };
  attendance: AttendanceItem[];
  attendanceSummary: {
    total: number;
    summaryLine: string;
  };
  joinObserverButton: React.ReactNode;
}

export function WardClassDetailView({
  studentId,
  offering,
  teacher,
  attendance,
  attendanceSummary,
  joinObserverButton,
}: WardClassDetailViewProps) {
  return (
    <Wrap>
      <Header>
        <BackLink href={`/guardian/w/${studentId}`}>
          ← Back to timetable
        </BackLink>
        <Title>{offering.title}</Title>
        <Subtitle>
          {offering.subjectName} · {offering.dayLabel} · {offering.timeLabel}
        </Subtitle>
      </Header>

      <ThreeCol>
        <OverviewCard>
          <CardHeader>
            <CardTitle>Class overview</CardTitle>
          </CardHeader>
          <CardContent>
            <StatGrid>
              <Stat label="Day" value={offering.dayLabel} />
              <Stat label="Time" value={offering.timeLabel} />
              <Stat label="Duration" value={offering.durationLabel} />
              <Stat
                label="Hourly rate"
                value={
                  offering.hourlyDisplay ? `${offering.hourlyDisplay}/hr` : "—"
                }
              />
              <Stat label="Class limit" value={offering.classLimit.toString()} />
              <Stat label="Enrolled" value={offering.enrolledCount.toString()} />
              <Stat
                label="Rules"
                value={offering.rulesLines.length > 0 ? "See below" : "—"}
              />
              <Stat
                label="Description"
                value={offering.description ? "See below" : "—"}
              />
            </StatGrid>

            {offering.description ? (
              <SubSection>
                <SubHeading>About this class</SubHeading>
                <Description>{offering.description}</Description>
              </SubSection>
            ) : null}

            {offering.rulesLines.length > 0 ? (
              <SubSection>
                <SubHeading>Rules &amp; expectations</SubHeading>
                <RuleList>
                  {offering.rulesLines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </RuleList>
              </SubSection>
            ) : null}
          </CardContent>
        </OverviewCard>

        <Card>
          <CardHeader>
            <CardTitle>Teacher</CardTitle>
          </CardHeader>
          <CardContent>
            <TeacherRow>
              <Avatar>
                {teacher.imageUrl ? (
                  <Image
                    src={teacher.imageUrl}
                    alt={`${teacher.name} profile photo`}
                    fill
                    sizes="56px"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                ) : (
                  <AvatarFallback>{teacher.initials}</AvatarFallback>
                )}
              </Avatar>
              <TeacherInfo>
                <TeacherName>{teacher.name}</TeacherName>
                <TeacherMeta>
                  <span aria-hidden>★</span>
                  {teacher.avgRating.toFixed(1)}{" "}
                  <span>({teacher.ratingsCount})</span>
                </TeacherMeta>
              </TeacherInfo>
            </TeacherRow>
            <TeacherActions>
              <PrimaryLink
                href={`/guardian/w/${studentId}/teachers/${teacher.id}`}
              >
                View teacher profile
              </PrimaryLink>
              {joinObserverButton}
            </TeacherActions>
          </CardContent>
        </Card>
      </ThreeCol>

      <Card>
        <CardHeader>
          <CardTitle>Attendance history</CardTitle>
          <CardDescription>{attendanceSummary.summaryLine}</CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <Muted>
              Sessions will appear here after the student joins or the teacher
              marks attendance.
            </Muted>
          ) : (
            <AttendanceList>
              {attendance.map((row) => (
                <AttendanceRow key={row.id}>
                  <div>
                    <SessionDate>
                      {row.sessionDate.toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </SessionDate>
                    <SessionSource>
                      {row.source === "AUTO_JOIN"
                        ? "Auto-recorded on join"
                        : "Marked by teacher"}
                    </SessionSource>
                  </div>
                  <Badge $status={row.status}>{row.status.toLowerCase()}</Badge>
                </AttendanceRow>
              ))}
            </AttendanceList>
          )}
        </CardContent>
      </Card>
    </Wrap>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <StatBox>
      <StatLabel>{label}</StatLabel>
      <StatValue>{value}</StatValue>
    </StatBox>
  );
}
