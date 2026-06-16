"use client";

import NextLink from "next/link";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { MARKETING } from "@/constants/marketing.constants";
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

/** Marketing-style secondary CTA link (homepage “I'm a teacher”, in-app Add class, etc.). */
export const marketingSecondaryCtaLinkStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${MARKETING.CTA_MIN_HEIGHT};
  padding: 0 ${SPACING.FIVE};
  border-radius: ${MARKETING.CTA_RADIUS};
  border: 1px solid ${MARKETING.CTA_SECONDARY_BORDER};
  background-color: ${MARKETING.CTA_SECONDARY_BG};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${MARKETING.CTA_SECONDARY_TEXT};
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background-color: ${MARKETING.CTA_SECONDARY_BG_HOVER};
    border-color: ${COLORS.MARKETING_BORDER_STRONG};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_28};
    outline-offset: 2px;
  }
`;

export const MarketingSecondaryCtaLink = styled(NextLink)`
  ${marketingSecondaryCtaLinkStyles}
`;

export const MarketingSecondaryCtaButton = styled.button`
  ${marketingSecondaryCtaLinkStyles}
  border: none;
  cursor: pointer;
  font-family: inherit;
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
