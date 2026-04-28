"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import { FlowingLinesBackground } from "./FlowingLinesBackground";

const AuthMain = styled.div`
  position: relative;
  flex: 1;
  width: 100%;
  padding: 24px 0 64px;
  overflow: hidden;
  background: #f5f5f7;
  font-family: ${FONTS.FAMILY.PRIMARY};
`;

const AuthCard = styled.div`
  position: relative;
  z-index: 1;
  width: min(100% - 4rem, 35rem);
  margin: ${SPACING.TWELVE} auto 0;
  padding: 3rem 3rem;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid hsl(214.3 31.8% 91.4%);
  border-radius: 20px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 24px rgba(10, 37, 64, 0.06);
`;

const Title = styled.h1`
  // margin: 0 0 10px;
  font-size: ${FONTS.SIZE.AUTH_TITLE};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: #0a2540;
  line-height: 1.25;
  letter-spacing: 0;
`;

const Lead = styled.p`
  margin: 0 0 24px;
  font-size: ${FONTS.SIZE.BASE};
  line-height: 1.55;
  color: #3d4d5f;
`;

export function AuthPageFrame({
  title,
  lead,
  children,
}: {
  title: string;
  lead: string;
  children: ReactNode;
}) {
  return (
    <AuthMain>
      <FlowingLinesBackground />
      <AuthCard>
        <Title>{title}</Title>
        <Lead>{lead}</Lead>
        {children}
      </AuthCard>
    </AuthMain>
  );
}
