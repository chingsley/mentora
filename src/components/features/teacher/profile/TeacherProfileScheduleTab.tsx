"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { TeacherOfferingCalendar } from "@/components/features/teacher/TeacherOfferingCalendar";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type {
  TeacherProfileScheduleOffering,
  TeacherProfileTabsProps,
} from "./TeacherProfileTabs.types";
import { TeacherProfileScheduleSetupForm } from "./TeacherProfileScheduleSetupForm";
import { TeacherProfileTabFooter } from "./TeacherProfileTabFooter";
import { useTeacherProfileSetupMode } from "./TeacherProfileSetupContext";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

const InfoBlock = styled.p`
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface TeacherProfileScheduleTabProps {
  scheduleOfferings: TeacherProfileScheduleOffering[];
  dialogSubjects: { id: string; name: string; defaultCap: number }[];
  inviteableStudents: { id: string; name: string; email: string }[];
  globalCap: number;
  billingCurrency: string;
  regionMinHourlyMajor: number | null;
  rateRegions: TeacherProfileTabsProps["rateRegions"];
  rateCells: TeacherProfileTabsProps["rateCells"];
  teacherRegionCode: string | null;
  onAdvance: () => void;
  onBack: () => void;
}

export function TeacherProfileScheduleTab({
  scheduleOfferings,
  dialogSubjects,
  inviteableStudents,
  globalCap,
  billingCurrency,
  regionMinHourlyMajor,
  rateRegions,
  rateCells,
  teacherRegionCode,
  onAdvance,
  onBack,
}: TeacherProfileScheduleTabProps) {
  const setupMode = useTeacherProfileSetupMode();

  const scheduleBody =
    dialogSubjects.length === 0 ? (
      <InfoBlock>
              Pick your subjects in the Courses tab first, then add class periods here.
      </InfoBlock>
    ) : (
      <TeacherOfferingCalendar
        offerings={scheduleOfferings}
        subjects={dialogSubjects}
        inviteableStudents={inviteableStudents}
        globalCap={globalCap}
        billingCurrency={billingCurrency}
        regionMinHourlyMajor={regionMinHourlyMajor}
        tileColorMode="subject"
        emptyStateMessage="No class periods yet. Pick day or week view and click an empty slot to add one."
      />
    );

  return (
    <Wrap>
      {setupMode ? (
        <TeacherProfileScheduleSetupForm
          scheduleOfferings={scheduleOfferings}
          dialogSubjects={dialogSubjects}
          globalCap={globalCap}
          billingCurrency={billingCurrency}
          regionMinHourlyMajor={regionMinHourlyMajor}
          rateRegions={rateRegions}
          rateCells={rateCells}
          teacherRegionCode={teacherRegionCode}
          onAdvance={onAdvance}
          onBack={onBack}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Switch between day, week, and month views. Use the arrows to move forward or back, or
                jump to today. Click an empty slot to add a class period, or click a block to edit.
                Times cannot overlap between subjects on the same day — you will see an error if a new
                slot conflicts with another.
              </CardDescription>
            </CardHeader>
            <CardContent>{scheduleBody}</CardContent>
          </Card>
          <TeacherProfileTabFooter onBack={onBack} onContinue={onAdvance} />
        </>
      )}
    </Wrap>
  );
}
