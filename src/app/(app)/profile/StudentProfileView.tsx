"use client";

import Image from "next/image";
import styled from "styled-components";
import { StudentBioForm } from "@/components/features/student/StudentBioForm";
import { StudentInterestsForm } from "@/components/features/student/StudentInterestsForm";
import { DashboardCard } from "@/components/features/teacher/dashboard/TeacherDashboardCard";
import { AppPageHeader } from "@/components/layouts/AppPageHeader";
import { PageWrap } from "@/components/ui/primitives";
import { CHIP, CHIP_TONE, type ChipTone } from "@/constants/chip.constants";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
const ProfileLayout = styled.div`
  display: grid;
  gap: ${SPACING.FIVE};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: minmax(17rem, 22rem) minmax(0, 1fr);
    align-items: start;
  }
`;

const SideStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
  min-width: 0;
`;

const SummaryCard = styled(DashboardCard)`
  padding: 0;
`;

const PhotoBanner = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-height: 16rem;
  background-color: ${DASHBOARD.ICON_TILE_BACKGROUND};
`;

const BannerFallback = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-size: ${FONTS.SIZE.PAGE_HEADER};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${DASHBOARD.ICON_TILE_COLOR};
`;

const SummaryBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  padding: ${SPACING.FIVE};

  ${LAYOUT.MEDIA.SM} {
    padding: ${SPACING.SIX};
  }
`;

const SummaryHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${SPACING.THREE};
`;

const SummaryTitle = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.CARD_TITLE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
  letter-spacing: -0.02em;
`;

const StatusPill = styled.span<{ $tone: ChipTone }>`
  flex-shrink: 0;
  border-radius: ${CHIP.RADIUS};
  padding: ${CHIP.PADDING_BLOCK} ${CHIP.PADDING_INLINE};
  font-size: ${CHIP.FONT_SIZE};
  font-weight: ${CHIP.FONT_WEIGHT};
  border: 1px solid ${(p) => CHIP_TONE[p.$tone].border};
  background-color: ${(p) => CHIP_TONE[p.$tone].background};
  color: ${(p) => CHIP_TONE[p.$tone].color};
`;

const FieldList = styled.dl`
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const FieldRow = styled.div`
  padding: ${SPACING.THREE} 0;
  border-bottom: 1px solid ${DASHBOARD.BORDER_SUBTLE};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const FieldLabel = styled.dt`
  margin: 0;
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${DASHBOARD.TEXT_MUTED};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const FieldValue = styled.dd`
  margin: ${SPACING.ONE} 0 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${DASHBOARD.TEXT_PRIMARY};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const PanelCard = styled(DashboardCard)`
  padding: 0;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: ${SPACING.FIVE} ${SPACING.FIVE} ${SPACING.FOUR};
  border-bottom: 1px solid ${DASHBOARD.BORDER_SUBTLE};
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.CARD_TITLE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
  letter-spacing: -0.02em;
`;

const PanelDescription = styled.p`
  margin: ${SPACING.ONE} 0 0;
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const PanelBody = styled.div`
  padding: ${SPACING.FIVE};

  ${LAYOUT.MEDIA.SM} {
    padding: ${SPACING.SIX};
  }
`;

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <FieldRow>
      <FieldLabel>{label}</FieldLabel>
      <FieldValue>{value}</FieldValue>
    </FieldRow>
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
  regionName,
  allSubjects,
}: StudentProfileViewProps) {
  return (
    <PageWrap>
      <AppPageHeader
        title="My profile"
        subtitle="Review your summary and update your bio and subject interests."
        profileImage={imageUrl}
        profileDisplayName={fullName}
      />

      <ProfileLayout>
        <SummaryCard>
          <PhotoBanner>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${fullName} profile photo`}
                fill
                sizes="(min-width: 1024px) 22rem, 100vw"
                style={{ objectFit: "cover" }}
                unoptimized
              />
            ) : (
              <BannerFallback>{initials}</BannerFallback>
            )}
          </PhotoBanner>

          <SummaryBody>
            <SummaryHead>
              <SummaryTitle>My profile</SummaryTitle>
              <StatusPill $tone={hasInterests ? "success" : "warning"}>
                {hasInterests ? "Profile ready" : "Pick interests"}
              </StatusPill>
            </SummaryHead>

            <FieldList>
              <ProfileField label="Name" value={fullName} />
              <ProfileField
                label="Active classes"
                value={activeClassCount.toString()}
              />
              <ProfileField
                label="Subject interests"
                value={interestSubjectIds.length.toString()}
              />
              {regionName ? (
                <ProfileField label="Region" value={regionName} />
              ) : null}
            </FieldList>
          </SummaryBody>
        </SummaryCard>

        <SideStack>
          <PanelCard>
            <PanelHeader>
              <PanelTitle>About you</PanelTitle>
              <PanelDescription>
                Share a bit so teachers know your goals.
              </PanelDescription>
            </PanelHeader>
            <PanelBody>
              <StudentBioForm initial={{ bio: bio ?? "" }} />
            </PanelBody>
          </PanelCard>

          <PanelCard>
            <PanelHeader>
              <PanelTitle>Subjects I want to learn</PanelTitle>
              <PanelDescription>
                We use these to recommend teachers and classes that match your
                interests.
              </PanelDescription>
            </PanelHeader>
            <PanelBody>
              <StudentInterestsForm
                allSubjects={allSubjects}
                initialSubjectIds={interestSubjectIds}
              />
            </PanelBody>
          </PanelCard>
        </SideStack>
      </ProfileLayout>
    </PageWrap>
  );
}
