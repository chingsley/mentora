"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import { appHyperLinkStyles } from "@/components/ui/Link";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export const DashboardCard = styled.article<{ $flush?: boolean; $fillColumn?: boolean; }>`
  background-color: ${DASHBOARD.CARD_BACKGROUND};
  border-radius: ${DASHBOARD.CARD_RADIUS};
  box-shadow: ${DASHBOARD.CARD_SHADOW};
  border: 1px solid ${DASHBOARD.CARD_BORDER};
  padding: ${(p) => (p.$flush ? "0" : SPACING.SIX)};
  overflow: hidden;

  ${(p) =>
    p.$fillColumn
      ? `
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  `
      : ""}
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  padding: ${SPACING.SIX} ${SPACING.SIX} ${SPACING.FOUR};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  color: ${DASHBOARD.TEXT_PRIMARY};
  letter-spacing: -0.02em;
`;

export interface TeacherDashboardCardHeaderProps {
  title: string;
  action?: ReactNode;
}

export function TeacherDashboardCardHeader({ title, action }: TeacherDashboardCardHeaderProps) {
  return (
    <HeaderRow>
      <Title>{title}</Title>
      {action ? <div>{action}</div> : null}
    </HeaderRow>
  );
}

export const DashboardCardBody = styled.div<{ $pad?: boolean; $fill?: boolean; }>`
  padding: ${(p) => (p.$pad === false ? "0" : `0 ${SPACING.SIX} ${SPACING.SIX}`)};

  ${(p) =>
    p.$fill
      ? `
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `
      : ""}
`;

export const DashboardLink = styled.span`
  a {
    ${appHyperLinkStyles}
  }
`;

export const DashboardScrollX = styled.div<{ $fill?: boolean; }>`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  ${(p) =>
    p.$fill
      ? `
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  `
      : ""}

  ${LAYOUT.MEDIA.REDUCED_MOTION} {
    scroll-behavior: auto;
  }
`;
