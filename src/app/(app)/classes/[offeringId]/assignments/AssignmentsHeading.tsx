"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const SubjectPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface AssignmentsHeadingProps {
  subjectName: string;
  children: React.ReactNode;
}

export function AssignmentsHeading({ subjectName, children }: AssignmentsHeadingProps) {
  return (
    <Row>
      {children}
      <SubjectPill>{subjectName}</SubjectPill>
    </Row>
  );
}
