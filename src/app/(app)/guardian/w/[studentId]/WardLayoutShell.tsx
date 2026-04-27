"use client";

import * as React from "react";
import styled from "styled-components";
import { SPACING } from "@/constants/spacing.constants";
import { WardSubNav } from "./WardSubNav";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

export interface WardLayoutShellProps {
  studentId: string;
  children: React.ReactNode;
}

export function WardLayoutShell({ studentId, children }: WardLayoutShellProps) {
  return (
    <Wrap>
      <WardSubNav studentId={studentId} />
      {children}
    </Wrap>
  );
}
