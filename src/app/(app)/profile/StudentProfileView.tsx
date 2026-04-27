"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ProfilePhotoForm } from "@/components/features/teacher/ProfilePhotoForm";
import { StudentBioForm } from "@/components/features/student/StudentBioForm";
import { StudentInterestsForm } from "@/components/features/student/StudentInterestsForm";
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

const AvatarImg = styled(Image)`
  object-fit: cover;
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

const StatusPill = styled.span<{ $tone: "success" | "warning" }>`
  border-radius: ${LAYOUT.RADIUS.FULL};
  padding: 0.125rem 0.625rem;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  background-color: ${(p) => (p.$tone === "success" ? "rgba(22, 163, 74, 0.1)" : "#fef3c7")};
  color: ${(p) => (p.$tone === "success" ? COLORS.SUCCESS : "#78350f")};
`;

const Bio = styled.p`
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

const InterestRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding-top: ${SPACING.ONE};
`;

const InterestPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem 0.625rem;
  font-size: ${FONTS.SIZE.XS};
  color: rgba(2, 8, 23, 0.8);
`;

const CtaBar = styled.div`
  margin-top: ${SPACING.FIVE};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.LG};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.THREE};
`;

const CtaText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const CtaLink = styled(Link)`
  display: inline-flex;
  height: 2.25rem;
  align-items: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.HEADER};
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.WHITE};
  text-decoration: none;

  &:hover {
    background-color: rgba(23, 32, 51, 0.9);
  }
`;

const TwoCol = styled.div`
  display: grid;
  gap: ${SPACING.SIX};

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <KpiBox>
      <KpiValue>{value}</KpiValue>
      <KpiLabel>{label}</KpiLabel>
    </KpiBox>
  );
}

export interface StudentProfileViewProps {
  fullName: string;
  firstName: string;
  lastName: string;
  initials: string;
  imageUrl: string | null;
  hasInterests: boolean;
  bio: string | null;
  activeClassCount: number;
  interestSubjectIds: string[];
  interestNames: string[];
  regionName: string | null;
  allSubjects: { id: string; name: string }[];
}

export function StudentProfileView({
  fullName,
  initials,
  imageUrl,
  hasInterests,
  bio,
  activeClassCount,
  interestSubjectIds,
  interestNames,
  regionName,
  allSubjects,
}: StudentProfileViewProps) {
  return (
    <Wrap>
      <HeroCard>
        <HeroRow>
          <Avatar>
            {imageUrl ? (
              <AvatarImg
                src={imageUrl}
                alt={`${fullName} profile photo`}
                fill
                sizes="112px"
                unoptimized
              />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <HeroBody>
            <TitleRow>
              <Name>{fullName}</Name>
              {hasInterests ? (
                <StatusPill $tone="success">Profile ready</StatusPill>
              ) : (
                <StatusPill $tone="warning">Pick your interests</StatusPill>
              )}
            </TitleRow>
            <Bio>
              {bio?.trim()
                ? bio
                : "Add a short bio so teachers know more about you."}
            </Bio>
            <KpiRow>
              <Kpi label="Active classes" value={activeClassCount.toString()} />
              <Kpi label="Interests" value={interestSubjectIds.length.toString()} />
              {regionName ? <Kpi label="Region" value={regionName} /> : null}
            </KpiRow>
            {interestNames.length > 0 ? (
              <InterestRow>
                {interestNames.map((name) => (
                  <InterestPill key={name}>{name}</InterestPill>
                ))}
              </InterestRow>
            ) : null}
          </HeroBody>
        </HeroRow>
        <CtaBar>
          <CtaText>
            Ready to find a teacher? Filter by the subjects you just picked.
          </CtaText>
          <CtaLink href="/teachers">Browse teachers</CtaLink>
        </CtaBar>
      </HeroCard>

      <TwoCol>
        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>
              A clear photo helps your teachers recognise you in class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePhotoForm
              currentImage={imageUrl}
              fallbackInitials={initials}
              hint="PNG, JPEG, or WebP · up to 2 MB. Optional but recommended."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About you</CardTitle>
            <CardDescription>Share a bit so teachers know your goals.</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentBioForm initial={{ bio: bio ?? "" }} />
          </CardContent>
        </Card>
      </TwoCol>

      <Card>
        <CardHeader>
          <CardTitle>Subjects I want to learn</CardTitle>
          <CardDescription>
            We use these to recommend teachers and classes that match your
            interests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentInterestsForm
            allSubjects={allSubjects}
            initialSubjectIds={interestSubjectIds}
          />
        </CardContent>
      </Card>
    </Wrap>
  );
}
