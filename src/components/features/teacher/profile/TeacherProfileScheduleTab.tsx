"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { WeeklyScheduleCalendar } from "@/components/features/teacher/WeeklyScheduleCalendar";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherProfileScheduleOffering } from "./TeacherProfileTabs.types";

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
  globalCap: number;
}

export function TeacherProfileScheduleTab({
  scheduleOfferings,
  dialogSubjects,
  globalCap,
}: TeacherProfileScheduleTabProps) {
  return (
    <Wrap>
      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
          <CardDescription>
            Click an empty slot to add a class period, or click a block to edit. Times cannot overlap between
            subjects on the same day — you will see an error if a new slot conflicts with another.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dialogSubjects.length === 0 ? (
            <InfoBlock>
              Pick your subjects in the Courses & rates tab first, then add class periods here.
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
