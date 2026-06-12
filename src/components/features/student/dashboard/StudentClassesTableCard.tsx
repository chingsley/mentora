"use client";

import { MoreHorizontal } from "lucide-react";
import styled from "styled-components";
import { Chip } from "@/components/ui/Chip";
import { AppHyperLink } from "@/components/ui/Link";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { ICON_BOX_TYPE, ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { StudentDashboardClassRow } from "@/types/studentDashboard";
import {
  DashboardCard,
  DashboardCardBody,
  DashboardLink,
  DashboardScrollX,
  TeacherDashboardCardHeader,
} from "@/components/features/teacher/dashboard/TeacherDashboardCard";

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
  font-size: ${FONTS.SIZE.MICRO};
  font-weight: ${FONTS.WEIGHT.BOLD};
  background: ${ICON_BOX_TYPE.SECONDARY.background};
  color: ${ICON_BOX_TYPE.SECONDARY.color};
`;

const ClassTitle = styled.span`
  display: block;
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const ClassMeta = styled.span`
  display: block;
  margin-top: ${SPACING.HALF};
  font-size: ${FONTS.SIZE.XS};
  color: ${DASHBOARD.TEXT_MUTED};
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: ${DASHBOARD.CHIP_RADIUS};
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

export interface StudentClassesTableCardProps {
  rows: StudentDashboardClassRow[];
}

export function StudentClassesTableCard({ rows }: StudentClassesTableCardProps) {
  return (
    <DashboardCard $flush $fillColumn>
      <TeacherDashboardCardHeader
        title="My classes"
        action={
          <DashboardLink>
            <AppHyperLink href="/classes">View all classes</AppHyperLink>
          </DashboardLink>
        }
      />
      <DashboardCardBody $pad={false} $fill>
        {rows.length === 0 ? (
          <Empty>
            You are not enrolled in any classes yet. Browse teachers to find a class that fits you.
          </Empty>
        ) : (
          <DashboardScrollX $fill>
            <Table>
              <thead>
                <tr>
                  <Th scope="col">Class</Th>
                  <Th scope="col">Teacher</Th>
                  <Th scope="col">Next session</Th>
                  <Th scope="col">Status</Th>
                  <Th scope="col" style={{ textAlign: "right" }}>
                    Actions
                  </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const initials = row.subjectName.slice(0, 2).toUpperCase();
                  const assignmentsHref = `/classes/${row.offeringId}/assignments`;
                  return (
                    <Tr key={row.id}>
                      <Td>
                        <ClassCell>
                          <IconDot aria-hidden>{initials}</IconDot>
                          <div>
                            <ClassTitle>{row.subjectName}</ClassTitle>
                            <ClassMeta>{row.title}</ClassMeta>
                          </div>
                        </ClassCell>
                      </Td>
                      <Td>{row.teacherName}</Td>
                      <Td>{row.sessionLabel}</Td>
                      <Td>
                        <Chip tone="active">Active</Chip>
                      </Td>
                      <Td>
                        <RowActions>
                          <AppHyperLink href={assignmentsHref}>Open</AppHyperLink>
                          <GhostBtn type="button" aria-label="More actions">
                            <MoreHorizontal size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
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
