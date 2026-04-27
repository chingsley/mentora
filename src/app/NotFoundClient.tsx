"use client";

import Link from "next/link";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Main = styled.main`
  margin: 0 auto;
  display: flex;
  min-height: 100dvh;
  max-width: 32rem;
  flex-direction: column;
  justify-content: center;
  gap: ${SPACING.FOUR};
  padding: 2.5rem ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    padding-left: ${SPACING.SIX};
    padding-right: ${SPACING.SIX};
  }
`;

const Title = styled.h1`
  font-size: ${FONTS.SIZE["2XL"]};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const Body = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  height: 2.5rem;
  width: fit-content;
  align-items: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.HEADER};
  padding: 0 ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.WHITE};
  text-decoration: none;

  &:hover {
    background-color: rgba(23, 32, 51, 0.9);
  }
`;

export function NotFoundClient() {
  return (
    <Main>
      <Title>Page not found</Title>
      <Body>The page you&apos;re looking for doesn&apos;t exist or has moved.</Body>
      <HomeLink href="/">Go home</HomeLink>
    </Main>
  );
}
