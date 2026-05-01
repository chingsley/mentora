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
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TeacherProfileHero } from "./TeacherProfileHero";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

const Grid = styled.div`
  display: grid;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.MD} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Muted = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: 1.5;
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

      <Grid>
        <Card>
          <CardHeader>
            <CardTitle>Bio & location</CardTitle>
            <CardDescription>What students see about you.</CardDescription>
          </CardHeader>
          <CardContent>
            <Muted>{bio.trim() ? bio : "No bio yet."}</Muted>
            <Muted style={{ marginTop: SPACING.THREE }}>
              <strong>Region:</strong> {teacherRegionName || "—"}
            </Muted>
            <Muted style={{ marginTop: SPACING.TWO }}>
              <strong>Display location:</strong> {locationLabel.trim() || "—"}
            </Muted>
            <Muted style={{ marginTop: SPACING.TWO }}>
              <strong>Languages:</strong> {spokenLanguages.trim() || "—"}
            </Muted>
            <Muted style={{ marginTop: SPACING.TWO }}>
              <strong>Time zone:</strong> {timeZone.trim() || "—"}
            </Muted>
          </CardContent>
        </Card>

        <Card>
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
              <RatesList style={{ marginTop: SPACING.THREE }}>
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
              <Muted style={{ marginTop: SPACING.TWO }}>No rates configured.</Muted>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Class periods on your calendar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Muted>
              <strong>Active periods:</strong> {offeringCount}
            </Muted>
          </CardContent>
        </Card>

        <Card>
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
        </Card>
      </Grid>
    </Wrap>
  );
}
