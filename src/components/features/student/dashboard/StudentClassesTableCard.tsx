"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";
import styled from "styled-components";
import { Chip } from "@/components/ui/Chip";
import { AppHyperLink } from "@/components/ui/Link";
import { COLORS } from "@/constants/colors.constants";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { ICON_BOX_TYPE, ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
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

const ThActions = styled(Th)`
  text-align: right;
`;

const TdActions = styled(Td)`
  text-align: right;
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

  &:focus-visible {
    outline: 2px solid ${COLORS.RING};
    outline-offset: 2px;
  }
`;

const ActionsRoot = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

const ActionMenu = styled.div<{ $open: boolean }>`
  position: absolute;
  bottom: calc(100% + ${SPACING.ONE});
  right: 0;
  z-index: ${LAYOUT.Z.STICKY};
  display: ${(p) => (p.$open ? "flex" : "none")};
  flex-direction: column;
  min-width: 10rem;
  padding: ${SPACING.ONE};
  border-radius: ${DASHBOARD.CARD_RADIUS};
  border: 1px solid ${DASHBOARD.CARD_BORDER};
  background-color: ${DASHBOARD.CARD_BACKGROUND};
  box-shadow: ${DASHBOARD.CARD_SHADOW};
`;

const ActionMenuLink = styled(Link)`
  display: block;
  padding: ${SPACING.TWO} ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.SM};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${DASHBOARD.TEXT_PRIMARY};
  text-decoration: none;

  &:hover {
    background: ${DASHBOARD.ROW_HOVER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.RING};
    outline-offset: 2px;
  }
`;

interface StudentClassRowActionsProps {
  offeringId: string;
}

function StudentClassRowActions({ offeringId }: StudentClassRowActionsProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const menuId = React.useId();
  const classHref = `/classes?class=${offeringId}`;

  React.useEffect(() => {
    if (!open) return;

    function onDocMouseDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <ActionsRoot ref={rootRef}>
      <GhostBtn
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label="More actions"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
      </GhostBtn>
      <ActionMenu $open={open} id={menuId} role="menu" aria-label="Class actions">
        <ActionMenuLink href={classHref} role="menuitem" onClick={() => setOpen(false)}>
          View class
        </ActionMenuLink>
      </ActionMenu>
    </ActionsRoot>
  );
}

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
                  <ThActions scope="col">Actions</ThActions>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const initials = row.subjectName.slice(0, 2).toUpperCase();
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
                      <TdActions>
                        <StudentClassRowActions offeringId={row.offeringId} />
                      </TdActions>
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
