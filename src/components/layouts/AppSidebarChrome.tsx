"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { AppNavItem } from "./appNavConfig";
import { AppNavIcon } from "./AppNavIcon";
import { SidebarAccountMenu } from "./SidebarAccountMenu";
import { WardSelector, type WardOption } from "./WardSelector";

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const Brand = styled.div<{ $collapsed: boolean; }>`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: stretch;
  padding: ${(p) => (p.$collapsed ? `${SPACING.FOUR} ${SPACING.TWO}` : `${SPACING.FOUR}`)};
  border-bottom: 1px solid ${COLORS.BORDER};
`;

const BrandTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: ${SPACING.TWO};
`;

const BrandLinkWrap = styled.div<{ $collapsed: boolean; }>`
  display: flex;
  flex: ${(p) => (p.$collapsed ? "none" : "1")};
  min-width: 0;
  justify-content: ${(p) => (p.$collapsed ? "center" : "flex-start")};
`;

const BrandCollapseToggle = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: none;
  border-radius: ${LAYOUT.RADIUS.MD};
  background: transparent;
  color: ${COLORS.SIDEBAR_MUTED};
  cursor: pointer;
  outline: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: ${COLORS.SIDEBAR_HOVER};
    color: ${COLORS.HEADER};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${COLORS.SIDEBAR_FOCUS_RING};
  }
`;

const BrandLink = styled(Link) <{ $collapsed: boolean; }>`
  display: ${(p) => (p.$collapsed ? "flex" : "inline")};
  align-items: center;
  justify-content: center;
  ${(p) =>
    p.$collapsed
      ? `width: 2.25rem; height: 2.25rem; border-radius: ${LAYOUT.RADIUS.MD}; font-size: ${FONTS.SIZE.SM};`
      : `font-size: ${FONTS.SIZE.SM};`}
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: -0.01em;
  color: ${COLORS.HEADER};
  outline: none;

  &:hover {
    color: ${COLORS.SIDEBAR_BRAND};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${COLORS.SIDEBAR_FOCUS_RING};
  }
`;

const Nav = styled.nav`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${SPACING.FOUR} ${SPACING.TWO};
`;

const NavList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
`;

const NavItemLink = styled(Link) <{ $collapsed: boolean; $active: boolean; }>`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  min-height: ${SPACING.TWELVE};
  padding: ${(p) => (p.$collapsed ? SPACING.TWO : `${SPACING.TWO} 0.625rem`)};
  justify-content: ${(p) => (p.$collapsed ? "center" : "flex-start")};
  box-sizing: border-box;
  border-radius: 2px;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  text-decoration: none;
  color: ${(p) => (p.$active ? COLORS.HEADER : COLORS.SIDEBAR_MUTED)};
  background-color: ${(p) => (p.$active ? COLORS.FOREGROUND : "transparent")};
  border-bottom: ${(p) =>
    p.$active ? `2px solid ${COLORS.SIDEBAR_ACCENT}` : "2px solid transparent"};
  outline: none;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-bottom 0.15s ease;

  &:hover {
    color: ${COLORS.HEADER};
    background-color: ${COLORS.FOREGROUND};
    border-bottom: ${(p) =>
    p.$active
      ? `2px solid ${COLORS.SIDEBAR_ACCENT}`
      : `1px solid ${COLORS.SIDEBAR_NAV_BORDER_HOVER}`};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${COLORS.SIDEBAR_FOCUS_RING};
  }
`;

const NavLabel = styled.span`
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Footer = styled.div`
  position: relative;
  flex-shrink: 0;
  border-top: 1px solid ${COLORS.BORDER};
  padding: ${LAYOUT.SIDEBAR_FOOTER_INSET_INLINE};
`;

const ToggleSvg = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
`;

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/") return false;
  return pathname.startsWith(`${href}/`);
}

function NavLinks({
  items,
  collapsed,
  onNavigate,
}: {
  items: AppNavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname() ?? "";
  return (
    <NavList>
      {items.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <li key={item.href}>
            <NavItemLink
              href={item.href}
              onClick={onNavigate}
              $collapsed={collapsed}
              $active={active}
              title={collapsed ? item.label : undefined}
            >
              <AppNavIcon name={item.icon} />
              {!collapsed ? <NavLabel>{item.label}</NavLabel> : null}
              {collapsed ? <SrOnly>{item.label}</SrOnly> : null}
            </NavItemLink>
          </li>
        );
      })}
    </NavList>
  );
}

export interface AppSidebarChromeProps {
  items: AppNavItem[];
  navCollapsed: boolean;
  showCollapseToggle: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
  user: { name?: string | null; email?: string | null; role: Role; };
  wards?: WardOption[];
}

export function AppSidebarChrome({
  items,
  navCollapsed,
  showCollapseToggle,
  onToggleCollapse,
  onNavigate,
  user,
  wards,
}: AppSidebarChromeProps) {
  return (
    <Shell>
      <Brand $collapsed={navCollapsed}>
        <BrandTop>
          <BrandLinkWrap $collapsed={navCollapsed}>
            <BrandLink
              href="/dashboard"
              onClick={(e) => {
                if (showCollapseToggle && navCollapsed) {
                  e.preventDefault();
                  onToggleCollapse();
                }
                onNavigate?.();
              }}
              $collapsed={navCollapsed}
              title={showCollapseToggle && navCollapsed ? "Expand sidebar" : "Mentora home"}
            >
              {navCollapsed ? "M" : "Mentora"}
            </BrandLink>
          </BrandLinkWrap>
          {showCollapseToggle && !navCollapsed ? (
            <BrandCollapseToggle
              type="button"
              onClick={onToggleCollapse}
              aria-expanded={!navCollapsed}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ToggleSvg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path strokeWidth="2" strokeLinecap="round" d="M15 5l-7 7 7 7" />
              </ToggleSvg>
            </BrandCollapseToggle>
          ) : null}
        </BrandTop>
      </Brand>

      <Nav aria-label="Main">
        <NavLinks items={items} collapsed={navCollapsed} onNavigate={onNavigate} />
      </Nav>

      {user.role === "GUARDIAN" && wards && wards.length > 0 ? (
        <WardSelector wards={wards} collapsed={navCollapsed} />
      ) : null}

      <Footer>
        <SidebarAccountMenu user={user} navCollapsed={navCollapsed} onNavigate={onNavigate} />
      </Footer>
    </Shell>
  );
}
