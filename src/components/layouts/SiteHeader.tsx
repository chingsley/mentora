"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

/** Aligns with legacy auth shell mobile breakpoint for the menu control. */
const MOBILE_NAV = `@media (max-width: 900px)`;

const Header = styled.header<{ $sticky: boolean }>`
  color: ${COLORS.WHITE};

  ${(p) =>
    p.$sticky
      ? css`
          position: sticky;
          top: 0;
          z-index: ${LAYOUT.Z.STICKY};
          min-height: 4.5rem;
          display: flex;
          align-items: center;
          background: color-mix(in srgb, ${COLORS.BACKGROUND} 92%, transparent);
          border-bottom: 1px solid ${COLORS.BORDER};
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        `
      : ""}
`;

const HeaderInner = styled.div<{ $padForMenuToggle: boolean }>`
  margin: 0 auto;
  display: flex;
  width: 100%;
  max-width: 72rem;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  min-width: 0;
  padding: ${SPACING.FIVE} ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    padding-left: ${SPACING.SIX};
    padding-right: ${SPACING.SIX};
  }

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
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: -0.025em;
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${COLORS.RING};
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
  gap: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
`;

const NavLink = styled(Link)`
  border-radius: ${LAYOUT.RADIUS.MD};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: inherit;
  text-decoration: none;
  background-color: ${COLORS.HEADER};
`;

const NavCta = styled(Link)`
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.HEADER};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: inherit;
  text-decoration: none;
`;

/** Optional control for future mobile drawer; fixed position matches prior auth shell. */
export const SiteHeaderMenuToggle = styled.button`
  display: none;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${LAYOUT.RADIUS.LG};
  background: ${COLORS.FOREGROUND};
  cursor: pointer;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.3125rem;

  span {
    display: block;
    width: 1.125rem;
    height: 2px;
    background: ${COLORS.HEADER};
    border-radius: 1px;
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.RING};
    outline-offset: 2px;
  }

  ${MOBILE_NAV} {
    display: flex;
    position: fixed;
    top: 1rem;
    right: 1.25rem;
    z-index: ${LAYOUT.Z.TOAST};
  }
`;

export interface SiteHeaderProps {
  /** Sticky blurred bar (e.g. auth layout); default is the flat marketing header. */
  sticky?: boolean;
  /** Extra controls after the default log in / sign up links (e.g. menu toggle). */
  endAdornment?: ReactNode;
}

export function SiteHeader({ sticky = false, endAdornment }: SiteHeaderProps) {
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
