"use client";

import * as React from "react";
import styled from "styled-components";
import { SiteHeader, SiteHeaderMenuToggle } from "@/components/layouts/SiteHeader";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${COLORS.BACKGROUND};
  color: ${COLORS.TEXT};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.BASE};
  line-height: 1.6;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <Root>
      <SiteHeader
        sticky
        endAdornment={
          <SiteHeaderMenuToggle type="button" aria-label="Open menu">
            <span />
            <span />
            <span />
          </SiteHeaderMenuToggle>
        }
      />
      <Main>{children}</Main>
    </Root>
  );
}
