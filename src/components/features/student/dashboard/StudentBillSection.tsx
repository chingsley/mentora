"use client";

import styled from "styled-components";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { StudentBillSummary } from "@/types/studentDashboard";
import { StudentBillSubjectCard } from "./StudentBillSubjectCard";

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
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

export interface StudentBillSectionProps {
  bill: StudentBillSummary;
}

export function StudentBillSection({ bill }: StudentBillSectionProps) {
  if (bill.totalSubjects === 0) {
    return (
      <Section>
        <Empty>
          No billing activity yet. Enroll in a class and completed sessions will appear here.
        </Empty>
      </Section>
    );
  }

  return (
    <Section aria-label="Billing breakdown">
      <SummaryGrid>
        <SummaryTile>
          <TileLabel>Total billed</TileLabel>
          <TileValue>{bill.totalAmountFormatted}</TileValue>
        </SummaryTile>
        <SummaryTile>
          <TileLabel>Sessions completed</TileLabel>
          <TileValue>{bill.totalSessions}</TileValue>
        </SummaryTile>
        <SummaryTile>
          <TileLabel>Subjects enrolled</TileLabel>
          <TileValue>{bill.totalSubjects}</TileValue>
        </SummaryTile>
      </SummaryGrid>

      <SubjectGrid>
        {bill.subjects.map((subject) => (
          <StudentBillSubjectCard key={subject.subjectId} subject={subject} />
        ))}
      </SubjectGrid>
    </Section>
  );
}
