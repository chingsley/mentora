"use client";

import styled from "styled-components";
import { Chip } from "@/components/ui/Chip";
import { AppHyperLink } from "@/components/ui/Link";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { ICON_THEME } from "@/constants/iconTheme.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherDashboardClassRow } from "@/types/teacherDashboard";
import {
  DashboardCard,
  DashboardCardBody,
  DashboardScrollX,
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
  color: ${DASHBOARD.TABLE_HEAD.TEXT};
  border-top: 1px solid ${DASHBOARD.TABLE_HEAD.BORDER_TOP};
  border-bottom: 1px solid ${DASHBOARD.BORDER_SUBTLE};
  background: ${DASHBOARD.TABLE_HEAD.BACKGROUND};
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
  font-size: ${FONTS.SIZE.MICRO};
  font-weight: ${FONTS.WEIGHT.BOLD};
  background: ${DASHBOARD.ICON_TILE_BACKGROUND};
  color: ${DASHBOARD.ICON_TILE_COLOR};
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
                        <Chip tone={row.status === "active" ? "active" : "neutral"}>
                          {row.status === "active" ? "Active" : "Paused"}
                        </Chip>
                      </Td>
                      <Td>
                        <RowActions>
                          <AppHyperLink href="/schedule">View</AppHyperLink>
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
