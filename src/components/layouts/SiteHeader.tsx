"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import * as React from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { MARKETING_NAV_LINKS } from "@/constants/marketingContent";
import { SPACING } from "@/constants/spacing.constants";

const Header = styled.header<{ $sticky: boolean }>`
  color: ${COLORS.MARKETING_TEXT_PRIMARY};

  ${(p) =>
    p.$sticky
      ? css`
          position: sticky;
          top: 0;
          z-index: ${LAYOUT.Z.STICKY};
          background: ${MARKETING.HEADER_SURFACE};
          border-bottom: 1px solid ${MARKETING.HEADER_BORDER};
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
        `
      : css`
          background: ${COLORS.TRANSPARENT};
        `}
`;

const HeaderInner = styled.div`
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
`;

const BrandRow = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.THREE};
  flex-shrink: 0;
  text-decoration: none;
`;

const BrandMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${MARKETING.BRAND_MARK_SIZE};
  height: ${MARKETING.BRAND_MARK_SIZE};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.ACTION_PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${COLORS.WHITE};
`;

const BrandName = styled.span`
  font-size: ${FONTS.SIZE.BASE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const NavRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${SPACING.THREE};
  min-width: 0;
`;

const MarketingNav = styled.nav`
  display: none;
  align-items: center;
  gap: ${SPACING.ONE};

  ${LAYOUT.MEDIA.LG} {
    display: flex;
  }
`;

const MarketingNavLink = styled(Link)<{ $active: boolean }>`
  border-radius: ${LAYOUT.RADIUS.MD};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  text-decoration: none;
  color: ${(p) => (p.$active ? COLORS.MARKETING_TEXT_PRIMARY : COLORS.MARKETING_TEXT_SECONDARY)};
  background-color: ${(p) => (p.$active ? COLORS.SURFACE_OFF_WHITE : COLORS.TRANSPARENT)};
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    color: ${COLORS.MARKETING_TEXT_PRIMARY};
    background-color: ${COLORS.SURFACE_OFF_WHITE};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_28};
    outline-offset: 2px;
  }
`;

const AuthNav = styled.nav`
  display: none;
  align-items: center;
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    display: flex;
  }
`;

const AuthNavLink = styled(Link)`
  border-radius: ${LAYOUT.RADIUS.MD};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.ACTION_PRIMARY};
  text-decoration: none;

  &:hover {
    color: ${COLORS.ACTION_PRIMARY_HOVER};
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
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${MARKETING.CTA_PRIMARY_TEXT};
  text-decoration: none;
  box-shadow: ${COLORS.ACTION_PRIMARY_SHADOW_MD};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${MARKETING.CTA_PRIMARY_BG_HOVER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
  }
`;

const MobileMenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${SPACING.TEN};
  height: ${SPACING.TEN};
  border: 1px solid ${COLORS.MARKETING_BORDER};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.FOREGROUND};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
  cursor: pointer;

  ${LAYOUT.MEDIA.LG} {
    display: none;
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY};
    outline-offset: 2px;
  }
`;

const MobilePanel = styled.div<{ $open: boolean }>`
  display: ${(p) => (p.$open ? "block" : "none")};
  border-top: 1px solid ${COLORS.MARKETING_BORDER};
  background-color: ${COLORS.FOREGROUND};

  ${LAYOUT.MEDIA.LG} {
    display: none;
  }
`;

const MobilePanelInner = styled.div`
  margin: 0 auto;
  max-width: ${MARKETING.MAX_WIDTH};
  padding: ${SPACING.FOUR} ${MARKETING.HERO_PADDING_INLINE} ${SPACING.FIVE};
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const MobileNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
`;

const MobileNavLink = styled(Link)<{ $active: boolean }>`
  border-radius: ${LAYOUT.RADIUS.MD};
  padding: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  text-decoration: none;
  color: ${(p) => (p.$active ? COLORS.MARKETING_TEXT_PRIMARY : COLORS.MARKETING_TEXT_SECONDARY)};
  background-color: ${(p) => (p.$active ? COLORS.SURFACE_OFF_WHITE : COLORS.TRANSPARENT)};
`;

const MobileAuthRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.THREE};
  padding-top: ${SPACING.TWO};
  border-top: 1px solid ${COLORS.MARKETING_BORDER};
`;

export const SiteHeaderMenuToggle = styled.button`
  display: none;
`;

export interface SiteHeaderProps {
  sticky?: boolean;
  showMarketingNav?: boolean;
  endAdornment?: ReactNode;
}

export function SiteHeader({ sticky = true, showMarketingNav = false, endAdornment }: SiteHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <Header $sticky={sticky}>
      <HeaderInner>
        <BrandRow href="/">
          <BrandMark aria-hidden>M</BrandMark>
          <BrandName>Mentora</BrandName>
        </BrandRow>
        <NavRow>
          {showMarketingNav ? (
            <MarketingNav aria-label="Marketing">
              {MARKETING_NAV_LINKS.map((link) => (
                <MarketingNavLink key={link.href} href={link.href} $active={pathname === link.href}>
                  {link.label}
                </MarketingNavLink>
              ))}
            </MarketingNav>
          ) : null}
          <AuthNav aria-label="Account">
            <AuthNavLink href="/login">Log in</AuthNavLink>
            <NavCta href="/register">Sign up</NavCta>
          </AuthNav>
          {showMarketingNav ? (
            <MobileMenuButton
              type="button"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <X size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
              ) : (
                <Menu size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
              )}
            </MobileMenuButton>
          ) : null}
          {endAdornment}
        </NavRow>
      </HeaderInner>
      {showMarketingNav ? (
        <MobilePanel $open={mobileOpen}>
          <MobilePanelInner>
            <MobileNav aria-label="Marketing mobile">
              {MARKETING_NAV_LINKS.map((link) => (
                <MobileNavLink
                  key={link.href}
                  href={link.href}
                  $active={pathname === link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </MobileNavLink>
              ))}
            </MobileNav>
            <MobileAuthRow>
              <AuthNavLink href="/login">Log in</AuthNavLink>
              <NavCta href="/register">Sign up</NavCta>
            </MobileAuthRow>
          </MobilePanelInner>
        </MobilePanel>
      ) : null}
    </Header>
  );
}
