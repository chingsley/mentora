"use client";

import NextLink from "next/link";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export const PrimaryLink = styled(NextLink)`
  display: inline-flex;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
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

export const SecondaryLink = styled(NextLink)`
  display: inline-flex;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    border-color: rgba(23, 32, 51, 0.4);
  }
`;

export const SmallPrimaryLink = styled(NextLink)`
  display: inline-flex;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.HEADER};
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.WHITE};
  text-decoration: none;

  &:hover {
    background-color: rgba(23, 32, 51, 0.9);
  }
`;

export const TextLink = styled(NextLink)<{ $variant?: "default" | "muted" }>`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  ${(p) =>
    p.$variant === "muted" &&
    css`
      font-weight: ${FONTS.WEIGHT.NORMAL};
      color: ${COLORS.MUTED_FOREGROUND};
    `}
`;
