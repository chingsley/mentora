"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import { SiteHeader } from "@/components/layouts/SiteHeader";
import { SiteFooter } from "@/components/features/marketing/SiteFooter";
import { COLORS } from "@/constants/colors.constants";

const Main = styled.main`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: ${COLORS.BACKGROUND};
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

export interface MarketingSiteShellProps {
  children: ReactNode;
}

export function MarketingSiteShell({ children }: MarketingSiteShellProps) {
  return (
    <Main>
      <SiteHeader sticky showMarketingNav />
      <Content>{children}</Content>
      <SiteFooter />
    </Main>
  );
}
