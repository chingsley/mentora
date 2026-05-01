"use client";

import { MoreHorizontal } from "lucide-react";
import styled from "styled-components";
import { AppHyperLink } from "@/components/ui/Link";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { ICON_BOX_TYPE, ICON_THEME } from "@/constants/iconTheme.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherDashboardClassRow } from "@/types/teacherDashboard";
import {
  DashboardCard,
  DashboardCardBody,
  DashboardLink,
  DashboardScrollX,
  TeacherDashboardCardHeader,
} from "./TeacherDashboardCard";

const Table = styled.table`
  width: 100%;
  min-width: 36rem;
  border-collapse: collapse;
  font-size: ${FONTS.SIZE.SM};
`;

const Th = styled.th`
  text-align: left;
  padding: ${SPACING.THREE} ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${DASHBOARD.TABLE_HEADER};
  border-bottom: 1px solid ${DASHBOARD.BORDER_SUBTLE};
  background: ${DASHBOARD.PAGE_BACKGROUND};
`;

const Td = styled.td`
  padding: ${SPACING.FOUR};
  border-bottom: 1px solid ${DASHBOARD.BORDER_SUBTLE};
  color: ${DASHBOARD.TEXT_PRIMARY};
  vertical-align: middle;
`;

const Tr = styled.tr`
  &:hover td {
    background: ${DASHBOARD.ROW_HOVER};
  }
`;

const ClassCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  min-width: 0;
`;

const IconDot = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  height: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  border-radius: ${ICON_THEME.METRIC_ICON_BOX_RADIUS};
  flex-shrink: 0;
  font-size: 0.625rem;
  font-weight: ${FONTS.WEIGHT.BOLD};
  background: ${ICON_BOX_TYPE.SECONDARY.background};
  color: ${ICON_BOX_TYPE.SECONDARY.color};
  border: ${ICON_BOX_TYPE.SECONDARY.border};
`;

const ClassTitle = styled.span`
  display: block;
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const CountCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.TWO};
  color: ${DASHBOARD.TEXT_SECONDARY};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: ${LAYOUT.RADIUS.FULL};
  font-size: ${FONTS.SIZE["2XS"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  background: ${DASHBOARD.BADGE_ACTIVE_BG};
  color: ${DASHBOARD.BADGE_ACTIVE_TEXT};
`;

const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: ${LAYOUT.RADIUS.MD};
  background: transparent;
  color: ${ICON_THEME.INLINE_MUTED};
  cursor: pointer;

  &:hover {
    background: ${DASHBOARD.ROW_HOVER};
    color: ${DASHBOARD.TEXT_PRIMARY};
  }
`;

const RowActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${SPACING.TWO};
`;

const Empty = styled.p`
  margin: 0;
  padding: ${SPACING.SIX};
  font-size: ${FONTS.SIZE.SM};
  color: ${DASHBOARD.TEXT_MUTED};
  text-align: center;
`;

export interface TeacherClassesTableCardProps {
  rows: TeacherDashboardClassRow[];
}

export function TeacherClassesTableCard({ rows }: TeacherClassesTableCardProps) {
  return (
    <DashboardCard $flush $fillColumn>
      <TeacherDashboardCardHeader
        title="My classes"
        action={
          <DashboardLink>
            <AppHyperLink href="/schedule">View all classes →</AppHyperLink>
          </DashboardLink>
        }
      />
      <DashboardCardBody $pad={false} $fill>
        {rows.length === 0 ? (
          <Empty>No active class periods yet. Add periods on your schedule.</Empty>
        ) : (
          <DashboardScrollX $fill>
            <Table>
              <thead>
                <tr>
                  <Th scope="col">Class</Th>
                  <Th scope="col">Students</Th>
                  <Th scope="col">Next session</Th>
                  <Th scope="col">Price</Th>
                  <Th scope="col">Status</Th>
                  <Th scope="col" style={{ textAlign: "right" }}>
                    Actions
                  </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const initials = row.subjectName.slice(0, 2).toUpperCase();
                  return (
                    <Tr key={row.id}>
                      <Td>
                        <ClassCell>
                          <IconDot aria-hidden>
                            {initials}
                          </IconDot>
                          <ClassTitle>{row.subjectName}</ClassTitle>
                        </ClassCell>
                      </Td>
                      <Td>
                        <CountCell>
                          <span>{row.studentCount}</span>
                        </CountCell>
                      </Td>
                      <Td>{row.sessionLabel}</Td>
                      <Td>{row.priceLabel}</Td>
                      <Td>
                        <Badge>{row.status === "active" ? "Active" : "Paused"}</Badge>
                      </Td>
                      <Td>
                        <RowActions>
                          <AppHyperLink href="/schedule">View</AppHyperLink>
                          <GhostBtn type="button" aria-label="More actions">
                            <MoreHorizontal size={18} />
                          </GhostBtn>
                        </RowActions>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </DashboardScrollX>
        )}
      </DashboardCardBody>
    </DashboardCard>
  );
}
