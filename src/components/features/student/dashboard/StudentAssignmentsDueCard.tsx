"use client";

import styled from "styled-components";
import { AppHyperLink } from "@/components/ui/Link";
import { COLORS } from "@/constants/colors.constants";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { StudentDashboardAssignmentItem } from "@/types/studentDashboard";
import {
  DashboardCard,
  DashboardCardBody,
  DashboardLink,
  TeacherDashboardCardHeader,
} from "@/components/features/teacher/dashboard/TeacherDashboardCard";

const ASSIGNMENTS_PREVIEW_LIMIT = 4;

const List = styled.ul`
  margin: 0;
  padding: 0 ${SPACING.SIX} ${SPACING.SIX};
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const Item = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  padding-bottom: ${SPACING.FOUR};
  border-bottom: 1px solid ${DASHBOARD.BORDER_SUBTLE};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const Title = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const Meta = styled.p`
  margin: 0;
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
  line-height: 1.45;
`;

const Due = styled.span<{ $overdue?: boolean }>`
  display: inline-block;
  margin-top: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${(p) => (p.$overdue ? COLORS.DESTRUCTIVE : DASHBOARD.TEXT_MUTED)};
`;

const FooterPad = styled.div`
  padding: 0 ${SPACING.SIX} ${SPACING.SIX};
`;

const Empty = styled.p`
  margin: 0;
  padding: 0 ${SPACING.SIX} ${SPACING.SIX};
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
  line-height: 1.5;
`;

const PendingMeta = styled.span`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${DASHBOARD.TEXT_SECONDARY};
`;

export interface StudentAssignmentsDueCardProps {
  items: StudentDashboardAssignmentItem[];
}

export function StudentAssignmentsDueCard({ items }: StudentAssignmentsDueCardProps) {
  const preview = items.slice(0, ASSIGNMENTS_PREVIEW_LIMIT);
  const pendingCount = items.length;

  return (
    <DashboardCard $flush>
      <TeacherDashboardCardHeader
        title="Assignments due"
        action={pendingCount > 0 ? <PendingMeta>{pendingCount} pending</PendingMeta> : null}
      />
      <DashboardCardBody $pad={false}>
        {items.length === 0 ? (
          <Empty>
            You&apos;re caught up — no outstanding assignments. New work from your teachers will show up
            here.
          </Empty>
        ) : (
          <>
            <List>
              {preview.map((item) => {
                const href = `/classes/${item.offeringId}/assignments/${item.id}`;
                const overdue = item.dueLabel === "Overdue";
                return (
                  <Item key={item.id}>
                    <Title>{item.title}</Title>
                    <Meta>
                      {item.subjectName} · {item.teacherName}
                    </Meta>
                    <Due $overdue={overdue}>{item.dueLabel}</Due>
                    <DashboardLink>
                      <AppHyperLink href={href}>Open assignment</AppHyperLink>
                    </DashboardLink>
                  </Item>
                );
              })}
            </List>
            <FooterPad>
              <DashboardLink>
                <AppHyperLink href="/classes">View all classes</AppHyperLink>
              </DashboardLink>
            </FooterPad>
          </>
        )}
      </DashboardCardBody>
    </DashboardCard>
  );
}
