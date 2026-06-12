"use client";

import NextLink from "next/link";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import { SURFACE } from "@/constants/surface.constants";

/** Shared body/inline navigation link: teal ink with a light underline. */
export const appHyperLinkStyles = css`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.ACTION_PRIMARY};
  text-decoration: underline;
  text-decoration-color: ${COLORS.ACTION_PRIMARY_BORDER_22};
  text-underline-offset: 0.15em;

  &:hover {
    color: ${COLORS.ACTION_PRIMARY_HOVER};
    text-decoration-color: ${COLORS.ACTION_PRIMARY_BORDER_25};
  }
`;

export const AppHyperLink = styled(NextLink)`
  ${appHyperLinkStyles}
`;

export const PrimaryLink = styled(NextLink)`
  display: inline-flex;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: ${SURFACE.RADIUS};
  background-color: ${COLORS.HEADER};
  padding: 0 ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.WHITE};
  text-decoration: none;

  &:hover {
    background-color: ${COLORS.GRAY_DARK_ALT};
  }
`;

export const SecondaryLink = styled(NextLink)`
  display: inline-flex;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: ${SURFACE.RADIUS};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    border-color: ${COLORS.HEADER_BORDER_25};
  }
`;

export const SmallPrimaryLink = styled(NextLink)`
  display: inline-flex;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: ${SURFACE.RADIUS};
  background-color: ${COLORS.HEADER};
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.WHITE};
  text-decoration: none;

  &:hover {
    background-color: ${COLORS.GRAY_DARK_ALT};
  }
`;

export const TextLink = styled(NextLink) <{ $variant?: "default" | "muted"; }>`
  ${appHyperLinkStyles}

  ${(p) =>
    p.$variant === "muted" &&
    css`
      color: ${COLORS.MUTED_FOREGROUND};
    `}
`;
