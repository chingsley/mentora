"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { SPACING } from "@/constants/spacing.constants";

/** Aligns with legacy auth shell mobile breakpoint for the menu control. */
const MOBILE_NAV = `@media (max-width: 900px)`;

const Header = styled.header<{ $sticky: boolean }>`
  color: ${COLORS.MARKETING_TEXT_PRIMARY};

  ${(p) =>
    p.$sticky
      ? css`
          position: sticky;
          top: 0;
          z-index: ${LAYOUT.Z.STICKY};
          min-height: ${MARKETING.HEADER_HEIGHT};
          display: flex;
          align-items: center;
          background: ${MARKETING.HEADER_SURFACE};
          border-bottom: 1px solid ${MARKETING.HEADER_BORDER};
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
        `
      : css`
          background: ${COLORS.TRANSPARENT};
        `}
`;

const HeaderInner = styled.div<{ $padForMenuToggle: boolean }>`
  margin: 0 auto;
  display: flex;
  width: 100%;
  max-width: ${MARKETING.MAX_WIDTH};
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.FOUR};
  min-width: 0;
  min-height: ${MARKETING.HEADER_HEIGHT};
  padding: 0 ${MARKETING.HERO_PADDING_INLINE};

  ${(p) =>
    p.$padForMenuToggle
      ? css`
          ${MOBILE_NAV} {
            position: relative;
            padding-right: 3.5rem;
          }
        `
      : ""}
`;

const Brand = styled(Link)`
  flex-shrink: 0;
  font-size: ${FONTS.SIZE.BASE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
  text-decoration: none;

  &:hover {
    color: ${COLORS.MARKETING_TEXT_PRIMARY};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY};
    outline-offset: 4px;
    border-radius: ${LAYOUT.RADIUS.MD};
  }
`;

const NavRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${SPACING.THREE};
  min-width: 0;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    gap: ${SPACING.THREE};
  }
`;

const NavLink = styled(Link)`
  border-radius: ${LAYOUT.RADIUS.MD};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.ACTION_PRIMARY};
  text-decoration: none;
  background-color: ${COLORS.TRANSPARENT};
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.72;
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_28};
    outline-offset: 2px;
  }
`;

const NavCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${MARKETING.CTA_RADIUS};
  background-color: ${MARKETING.CTA_PRIMARY_BG};
  padding: ${SPACING.TWO} ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${MARKETING.CTA_PRIMARY_TEXT};
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${MARKETING.CTA_PRIMARY_BG_HOVER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
  }
`;

/** Optional control for future mobile drawer; fixed position matches prior auth shell. */
export const SiteHeaderMenuToggle = styled.button`
  display: none;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid ${COLORS.MARKETING_BORDER};
  border-radius: ${MARKETING.CTA_RADIUS};
  background: ${COLORS.FOREGROUND};
  cursor: pointer;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${SPACING.HALF};

  span {
    display: block;
    width: 1.125rem;
    height: 1px;
    background: ${COLORS.MARKETING_TEXT_PRIMARY};
    border-radius: 1px;
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY};
    outline-offset: 2px;
  }

  ${MOBILE_NAV} {
    display: flex;
    position: fixed;
    top: ${SPACING.FOUR};
    right: ${SPACING.FIVE};
    z-index: ${LAYOUT.Z.TOAST};
  }
`;

export interface SiteHeaderProps {
  /** Sticky frosted bar (default for marketing homepage). */
  sticky?: boolean;
  /** Extra controls after the default log in / sign up links (e.g. menu toggle). */
  endAdornment?: ReactNode;
}

export function SiteHeader({ sticky = true, endAdornment }: SiteHeaderProps) {
  return (
    <Header $sticky={sticky}>
      <HeaderInner $padForMenuToggle={Boolean(endAdornment)}>
        <Brand href="/">Mentora</Brand>
        <NavRow>
          <Nav aria-label="Account">
            <NavLink href="/login">Log in</NavLink>
            <NavCta href="/register">Sign up</NavCta>
          </Nav>
          {endAdornment}
        </NavRow>
      </HeaderInner>
    </Header>
  );
}
