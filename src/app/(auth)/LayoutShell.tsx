"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${COLORS.MARKETING_TEXT_PRIMARY};
  color: ${COLORS.TEXT};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.BASE};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
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
      <Main>{children}</Main>
    </Root>
  );
}
