"use client";

import type { DayOfWeek } from "@prisma/client";
import Image from "next/image";
import styled from "styled-components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ProfilePhotoForm } from "@/components/features/teacher/ProfilePhotoForm";
import { TeacherBioForm } from "@/components/features/teacher/TeacherBioForm";
import { TeacherSubjectsForm } from "@/components/features/teacher/TeacherSubjectsForm";
import { TeacherRatesGrid } from "@/components/features/teacher/TeacherRatesGrid";
import { WeeklyScheduleCalendar } from "@/components/features/teacher/WeeklyScheduleCalendar";
import { ProfileCompletenessBar } from "@/components/features/teacher/ProfileCompletenessBar";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

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

const TwoCol = styled.div`
  display: grid;
  gap: ${SPACING.SIX};

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const SubjectPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
  padding-top: ${SPACING.TWO};
`;

const SubjectPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem 0.625rem;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.HEADER};
`;

const SubjectMeta = styled.span`
  color: ${COLORS.MUTED_FOREGROUND};
`;

const RatesList = styled.ul`
  margin-top: ${SPACING.THREE};
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
`;

const RateRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RateLabel = styled.span`
  color: rgba(2, 8, 23, 0.8);
`;

const RateValue = styled.span`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const InfoBlock = styled.p`
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

interface TeacherSubject {
  subjectId: string;
  subjectName: string;
  defaultCap: number | null;
  studentCount: number;
}

interface RateRowItem {
  id: string;
  subjectName: string;
  regionName: string;
  hourlyDisplay: string;
}

interface ScheduleOffering {
  id: string;
  title: string;
  description: string | null;
  subjectId: string;
  subjectName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  teacherCap: number;
  enrolled: number;
}

export interface TeacherProfileViewProps {
  fullName: string;
  initials: string;
  imageUrl: string | null;
  displayId: string;
  profileCompleted: boolean;
  headline: string;
  rating: number;
  ratingsCount: number;
  hoursTaught: number;
  offeringCount: number;
  activeStudentCount: number;
  globalCap: number;
  checklist: { label: string; done: boolean }[];
  allSubjects: { id: string; name: string }[];
  bio: string;
  initialSubjects: { subjectId: string; defaultCap: number | null }[];
  taughtSubjects: { id: string; name: string; defaultCap: number | null }[];
  taughtSubjectsWithStudents: TeacherSubject[];
  rateRegions: {
    id: string;
    code: string;
    name: string;
    currency: string;
    minMajor: number;
  }[];
  rateCells: { subjectId: string; regionCode: string; hourlyMajor: number }[];
  rateRows: RateRowItem[];
  dialogSubjects: { id: string; name: string; defaultCap: number }[];
  scheduleOfferings: ScheduleOffering[];
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <KpiBox>
      <KpiValue>{value}</KpiValue>
      <KpiLabel>{label}</KpiLabel>
    </KpiBox>
  );
}

export function TeacherProfileView({
  fullName,
  initials,
  imageUrl,
  displayId,
  profileCompleted,
  headline,
  rating,
  ratingsCount,
  hoursTaught,
  offeringCount,
  activeStudentCount,
  globalCap,
  checklist,
  allSubjects,
  bio,
  initialSubjects,
  taughtSubjects,
  taughtSubjectsWithStudents,
  rateRegions,
  rateCells,
  rateRows,
  dialogSubjects,
  scheduleOfferings,
}: TeacherProfileViewProps) {
  return (
    <Wrap>
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
            <Headline>
              {headline || "Add a headline in the Profile details section."}
            </Headline>
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
          <ProfileCompletenessBar items={checklist} />
        </CompletenessWrap>
      </HeroCard>

      <TwoCol>
        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>
              A clear, recent photo helps students pick the right teacher.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePhotoForm
              currentImage={imageUrl}
              fallbackInitials={initials}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>Headline and about section.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeacherBioForm initial={{ headline, bio }} />
          </CardContent>
        </Card>
      </TwoCol>

      <Card>
        <CardHeader>
          <CardTitle>Subjects I teach</CardTitle>
          <CardDescription>
            Pick your subjects and set a default class size limit for each. The
            admin cap is <strong>{globalCap}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherSubjectsForm
            allSubjects={allSubjects}
            initial={initialSubjects.map((s) => ({
              subjectId: s.subjectId,
              defaultCap: s.defaultCap,
            }))}
            globalCap={globalCap}
          />
          {taughtSubjectsWithStudents.length > 0 ? (
            <SubjectPills>
              {taughtSubjectsWithStudents.map((s) => (
                <SubjectPill key={s.subjectId}>
                  {s.subjectName}
                  <SubjectMeta>
                    · {s.studentCount} student{s.studentCount === 1 ? "" : "s"}
                  </SubjectMeta>
                </SubjectPill>
              ))}
            </SubjectPills>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hourly rates</CardTitle>
          <CardDescription>
            Set a rate per subject for each region. Students are billed by the
            hour based on the class periods they enroll in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherRatesGrid
            subjects={taughtSubjects.map((s) => ({ id: s.id, name: s.name }))}
            regions={rateRegions}
            rates={rateCells}
          />
          {rateRows.length > 0 ? (
            <RatesList>
              {rateRows.map((r) => (
                <RateRow key={r.id}>
                  <RateLabel>
                    {r.subjectName} &middot; {r.regionName}
                  </RateLabel>
                  <RateValue>{r.hourlyDisplay}/hr</RateValue>
                </RateRow>
              ))}
            </RatesList>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
          <CardDescription>
            Click an empty slot to add a class period, or click an existing
            block to edit. Each period has its own capacity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dialogSubjects.length === 0 ? (
            <InfoBlock>
              Pick your subjects above first, then come back here to schedule
              class periods.
            </InfoBlock>
          ) : (
            <WeeklyScheduleCalendar
              offerings={scheduleOfferings}
              subjects={dialogSubjects}
              globalCap={globalCap}
            />
          )}
        </CardContent>
      </Card>
    </Wrap>
  );
}
