"use client";

import type { ReportStatus } from "@prisma/client";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { ReportStatusForm } from "./ReportStatusForm";

const List = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;

  & > li + li {
    border-top: 1px solid ${COLORS.BORDER};
  }
`;

const Row = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  padding: ${SPACING.FOUR} 0;
`;

const Top = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const TeacherName = styled.span`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Pill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ReasonPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid #fda4af;
  background-color: #fff1f2;
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  color: #881337;
`;

const StatusPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  text-transform: uppercase;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Time = styled.span`
  margin-left: auto;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Description = styled.p`
  white-space: pre-wrap;
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

const Reporter = styled.p`
  font-size: 11px;
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface AdminReportItem {
  id: string;
  teacherName: string;
  teacherEmail: string;
  reasonLabel: string;
  status: ReportStatus;
  createdAtLabel: string;
  description: string;
  reporterRole: string;
}

export interface ReportsListProps {
  reports: AdminReportItem[];
}

export function ReportsList({ reports }: ReportsListProps) {
  return (
    <List>
      {reports.map((r) => (
        <Row key={r.id}>
          <Top>
            <TeacherName>{r.teacherName}</TeacherName>
            <Pill>{r.teacherEmail}</Pill>
            <ReasonPill>{r.reasonLabel}</ReasonPill>
            <StatusPill>{r.status.toLowerCase()}</StatusPill>
            <Time>{r.createdAtLabel}</Time>
          </Top>
          <Description>{r.description}</Description>
          <Reporter>Reported by {r.reporterRole.toLowerCase()}</Reporter>
          <ReportStatusForm reportId={r.id} currentStatus={r.status} />
        </Row>
      ))}
    </List>
  );
}
