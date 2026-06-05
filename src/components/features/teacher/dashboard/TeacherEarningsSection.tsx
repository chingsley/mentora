"use client";

import styled from "styled-components";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherEarningsSummary } from "@/types/teacherEarnings";
import { TeacherEarningsSubjectCard } from "./TeacherEarningsSubjectCard";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
`;

const Empty = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${DASHBOARD.TEXT_MUTED};
  text-align: center;
  padding: ${SPACING.TEN} ${SPACING.FOUR};
`;

const SummaryGrid = styled.div`
  display: grid;
  gap: ${SPACING.FOUR};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const SummaryTile = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  padding: ${SPACING.FIVE};
  background-color: ${DASHBOARD.CARD_BACKGROUND};
  border: 1px solid ${DASHBOARD.CARD_BORDER};
  border-radius: ${DASHBOARD.CARD_RADIUS};
  box-shadow: ${DASHBOARD.CARD_SHADOW};
`;

const TileLabel = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${DASHBOARD.TABLE_HEADER};
`;

const TileValue = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.STAT_VALUE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: -0.03em;
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const TileHint = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${DASHBOARD.TEXT_MUTED};
`;

const SubjectGrid = styled.div`
  display: grid;
  gap: ${SPACING.FOUR};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export interface TeacherEarningsSectionProps {
  earnings: TeacherEarningsSummary;
}

export function TeacherEarningsSection({ earnings }: TeacherEarningsSectionProps) {
  if (earnings.totalSubjects === 0) {
    return (
      <Section>
        <Empty>
          No earnings yet. Completed class sessions with enrolled students will appear here.
        </Empty>
      </Section>
    );
  }

  return (
    <Section aria-label="Earnings breakdown">
      <SummaryGrid>
        <SummaryTile>
          <TileLabel>Net earnings</TileLabel>
          <TileValue>{earnings.netAmountFormatted}</TileValue>
          <TileHint>After {earnings.commissionPercent}% platform fee</TileHint>
        </SummaryTile>
        <SummaryTile>
          <TileLabel>Gross revenue</TileLabel>
          <TileValue>{earnings.grossAmountFormatted}</TileValue>
          <TileHint>Before commission</TileHint>
        </SummaryTile>
        <SummaryTile>
          <TileLabel>Classes held</TileLabel>
          <TileValue>{earnings.totalClassesHeld}</TileValue>
          <TileHint>
            {earnings.totalSessions} billable student-session
            {earnings.totalSessions === 1 ? "" : "s"}
          </TileHint>
        </SummaryTile>
        <SummaryTile>
          <TileLabel>Subjects taught</TileLabel>
          <TileValue>{earnings.totalSubjects}</TileValue>
          <TileHint>Commission {earnings.commissionAmountFormatted}</TileHint>
        </SummaryTile>
      </SummaryGrid>

      <SubjectGrid>
        {earnings.subjects.map((subject) => (
          <TeacherEarningsSubjectCard key={subject.subjectId} subject={subject} />
        ))}
      </SubjectGrid>
    </Section>
  );
}
