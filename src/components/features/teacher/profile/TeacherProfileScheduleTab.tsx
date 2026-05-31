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
import type { TeacherProfileScheduleOffering } from "./TeacherProfileTabs.types";
import { TeacherProfileTabFooter } from "./TeacherProfileTabFooter";

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
  onAdvance: () => void;
  onBack: () => void;
}

export function TeacherProfileScheduleTab({
  scheduleOfferings,
  dialogSubjects,
  inviteableStudents,
  globalCap,
  onAdvance,
  onBack,
}: TeacherProfileScheduleTabProps) {
  return (
    <Wrap>
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
        <CardContent>
          {dialogSubjects.length === 0 ? (
            <InfoBlock>
              Pick your subjects in the Courses & rates tab first, then add class periods here.
            </InfoBlock>
          ) : (
            <TeacherOfferingCalendar
              offerings={scheduleOfferings}
              subjects={dialogSubjects}
              inviteableStudents={inviteableStudents}
              globalCap={globalCap}
              tileColorMode="subject"
              emptyStateMessage="No class periods yet. Pick day or week view and click an empty slot to add one."
            />
          )}
        </CardContent>
      </Card>
      <TeacherProfileTabFooter onBack={onBack} onContinue={onAdvance} />
    </Wrap>
  );
}
