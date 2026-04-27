"use client";

import Link from "next/link";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
`;

const Header = styled.header`
  background-color: ${COLORS.HEADER};
  color: white;
`;

const HeaderInner = styled.div`
  max-width: ${LAYOUT.CONTENT_MAX_WIDTH};
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${SPACING.FIVE} ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    padding: ${SPACING.FIVE} ${SPACING.SIX};
  }
`;

const Brand = styled(Link)`
  font-size: ${FONTS.SIZE.XL};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: white;

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: ${SPACING.TEN} ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    padding: ${SPACING.TEN} ${SPACING.SIX};
  }

  ${LAYOUT.MEDIA.MD} {
    width: 40%;
  }
`;

const Card = styled.div`
  width: 100%;
`;

export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Root>
      <Header>
        <HeaderInner>
          <Brand href="/">Mentora</Brand>
        </HeaderInner>
      </Header>
      <Main>
        <Card>{children}</Card>
      </Main>
    </Root>
  );
}
