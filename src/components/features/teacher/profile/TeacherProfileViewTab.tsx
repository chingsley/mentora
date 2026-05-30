"use client";

import styled from "styled-components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TeacherProfileHero } from "./TeacherProfileHero";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

const ProfileSummaryCard = styled(Card)`
  width: 100%;
`;

const SectionDivider = styled.hr`
  margin: ${SPACING.FIVE} 0;
  border: none;
  border-top: 1px solid ${COLORS.BORDER};
`;

const Muted = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const DetailStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const RatesList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
`;

const RateRow = styled.li`
  display: flex;
  justify-content: space-between;
  gap: ${SPACING.TWO};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
`;

export type TeacherProfileViewTabProps = Pick<
  TeacherProfileTabsProps,
  | "fullName"
  | "initials"
  | "imageUrl"
  | "displayId"
  | "profileCompleted"
  | "headline"
  | "bio"
  | "rating"
  | "ratingsCount"
  | "hoursTaught"
  | "offeringCount"
  | "activeStudentCount"
  | "checklist"
  | "teacherRegionName"
  | "timeZone"
  | "spokenLanguages"
  | "locationLabel"
  | "taughtSubjects"
  | "rateRows"
  | "payoutLegalName"
  | "payoutPreferredMethod"
> & {
  onNavigateTab: (tab: string) => void;
};

export function TeacherProfileViewTab({
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
  teacherRegionName,
  timeZone,
  spokenLanguages,
  locationLabel,
  taughtSubjects,
  rateRows,
  payoutLegalName,
  payoutPreferredMethod,
  onNavigateTab,
}: TeacherProfileViewTabProps) {
  const firstIncomplete = checklist.find((c) => !c.done && c.editTab);
  const payoutConfigured = Boolean(payoutLegalName?.trim() || payoutPreferredMethod?.trim());

  return (
    <Wrap>
      <TeacherProfileHero
        fullName={fullName}
        initials={initials}
        imageUrl={imageUrl}
        displayId={displayId}
        profileCompleted={profileCompleted}
        headline={headline}
        bio={bio}
        rating={rating}
        ratingsCount={ratingsCount}
        hoursTaught={hoursTaught}
        offeringCount={offeringCount}
        activeStudentCount={activeStudentCount}
        checklist={checklist}
        onNavigateTab={onNavigateTab}
      />

      {firstIncomplete ? (
        <Actions>
          <Button type="button" onClick={() => onNavigateTab(firstIncomplete.editTab!)}>
            Continue setup: {firstIncomplete.label}
          </Button>
        </Actions>
      ) : null}

      <ProfileSummaryCard>
        <CardHeader>
          <CardTitle>Bio & location</CardTitle>
          <CardDescription>What students see about you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Muted>{bio.trim() ? bio : "No bio yet."}</Muted>
          <DetailStack>
            <Muted>
              <strong>Region:</strong> {teacherRegionName || "—"}
            </Muted>
            <Muted>
              <strong>Display location:</strong> {locationLabel.trim() || "—"}
            </Muted>
            <Muted>
              <strong>Languages:</strong> {spokenLanguages.trim() || "—"}
            </Muted>
            <Muted>
              <strong>Time zone:</strong> {timeZone.trim() || "—"}
            </Muted>
          </DetailStack>
        </CardContent>

        <SectionDivider aria-hidden />

        <CardHeader>
          <CardTitle>Courses & rates</CardTitle>
          <CardDescription>Subjects and hourly pricing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Muted>
            <strong>Subjects:</strong>{" "}
            {taughtSubjects.length > 0
              ? taughtSubjects.map((s) => s.name).join(", ")
              : "None yet."}
          </Muted>
          {rateRows.length > 0 ? (
            <RatesList>
              {rateRows.map((r) => (
                <RateRow key={r.id}>
                  <span>
                    {r.subjectName} · {r.regionName}
                  </span>
                  <span>{r.hourlyDisplay}/hr</span>
                </RateRow>
              ))}
            </RatesList>
          ) : (
            <Muted>No rates configured.</Muted>
          )}
        </CardContent>

        <SectionDivider aria-hidden />

        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Class periods on your calendar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Muted>
            <strong>Active periods:</strong> {offeringCount}
          </Muted>
        </CardContent>

        <SectionDivider aria-hidden />

        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Payout preferences (optional for profile completion).</CardDescription>
        </CardHeader>
        <CardContent>
          <Muted>
            {payoutConfigured
              ? "Payout details on file — you can update them anytime."
              : "Not configured yet — add details in the Payment tab when you are ready."}
          </Muted>
        </CardContent>
      </ProfileSummaryCard>
    </Wrap>
  );
}
