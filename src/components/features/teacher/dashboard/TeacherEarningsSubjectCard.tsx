"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_BOX_TYPE, ICON_THEME } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherEarningsSubject } from "@/types/teacherEarnings";

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  min-height: 13rem;
  padding: ${SPACING.FIVE};
  background-color: ${DASHBOARD.CARD_BACKGROUND};
  border: 1px solid ${DASHBOARD.CARD_BORDER};
  border-radius: ${DASHBOARD.CARD_RADIUS};
  box-shadow: ${DASHBOARD.CARD_SHADOW};
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  min-width: 0;
`;

const InitialsDot = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  height: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  flex-shrink: 0;
  border-radius: ${ICON_THEME.METRIC_ICON_BOX_RADIUS};
  font-size: ${FONTS.SIZE.MICRO};
  font-weight: ${FONTS.WEIGHT.BOLD};
  background: ${ICON_BOX_TYPE.SECONDARY.background};
  color: ${ICON_BOX_TYPE.SECONDARY.color};
`;

const Heading = styled.div`
  min-width: 0;
`;

const SubjectName = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.MD};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Rate = styled.p`
  margin: ${SPACING.HALF} 0 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${DASHBOARD.TEXT_SECONDARY};
`;

const AmountBlock = styled.div`
  margin-top: auto;
`;

const Amount = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.STAT_VALUE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: -0.03em;
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const Gross = styled.p`
  margin: ${SPACING.ONE} 0 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${DASHBOARD.TEXT_MUTED};
`;

const Sessions = styled.p`
  margin: ${SPACING.HALF} 0 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${DASHBOARD.TEXT_MUTED};
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
  padding-top: ${SPACING.FOUR};
  border-top: 1px solid ${DASHBOARD.BORDER_SUBTLE};
`;

const Chip = styled.span<{ $bg: string; $fg: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
  padding: 0.125rem ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.FULL};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
`;

const ChipValue = styled.strong`
  font-weight: ${FONTS.WEIGHT.BOLD};
`;

export interface TeacherEarningsSubjectCardProps {
  subject: TeacherEarningsSubject;
}

export function TeacherEarningsSubjectCard({ subject }: TeacherEarningsSubjectCardProps) {
  const initials = subject.subjectName.slice(0, 2).toUpperCase();
  return (
    <Card>
      <Top>
        <InitialsDot aria-hidden>{initials}</InitialsDot>
        <Heading>
          <SubjectName>{subject.subjectName}</SubjectName>
          <Rate>{subject.rateFormatted} / session</Rate>
        </Heading>
      </Top>

      <AmountBlock>
        <Amount>{subject.netAmountFormatted}</Amount>
        <Gross>Gross {subject.grossAmountFormatted}</Gross>
        <Sessions>
          {subject.classesHeld} class{subject.classesHeld === 1 ? "" : "es"} held ·{" "}
          {subject.sessionsCompleted} billable session
          {subject.sessionsCompleted === 1 ? "" : "s"}
        </Sessions>
      </AmountBlock>

      <Chips>
        <Chip $bg={COLORS.SURFACE_NEUTRAL_HOVER} $fg={DASHBOARD.TEXT_SECONDARY}>
          Held <ChipValue>{subject.classesHeld}</ChipValue>
        </Chip>
        <Chip $bg={COLORS.STATUS_PRESENT_BG} $fg={COLORS.STATUS_PRESENT_TEXT}>
          Present <ChipValue>{subject.present}</ChipValue>
        </Chip>
        <Chip $bg={COLORS.STATUS_ABSENT_BG} $fg={COLORS.STATUS_ABSENT_TEXT}>
          Absent <ChipValue>{subject.absent}</ChipValue>
        </Chip>
        <Chip $bg={COLORS.STATUS_LATE_BG} $fg={COLORS.STATUS_LATE_TEXT}>
          Late <ChipValue>{subject.late}</ChipValue>
        </Chip>
      </Chips>
    </Card>
  );
}
