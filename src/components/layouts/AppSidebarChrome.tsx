"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import styled from "styled-components";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { AppNavItem } from "./appNavConfig";
import { AppNavIcon } from "./AppNavIcon";
import { SignOutButton } from "./SignOutButton";
import { WardSelector, type WardOption } from "./WardSelector";

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const Brand = styled.div<{ $collapsed: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: ${(p) => (p.$collapsed ? "center" : "flex-start")};
  padding: ${(p) => (p.$collapsed ? `${SPACING.FOUR} ${SPACING.TWO}` : `${SPACING.FOUR}`)};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const BrandLink = styled(Link)<{ $collapsed: boolean }>`
  display: ${(p) => (p.$collapsed ? "flex" : "inline")};
  align-items: center;
  justify-content: center;
  ${(p) =>
    p.$collapsed
      ? `width: 2.25rem; height: 2.25rem; border-radius: ${LAYOUT.RADIUS.MD}; font-size: ${FONTS.SIZE.LG};`
      : `font-size: ${FONTS.SIZE.LG};`}
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: -0.01em;
  color: white;
  outline: none;

  &:hover {
    opacity: 0.9;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
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
  gap: 0.125rem;
`;

const NavItemLink = styled(Link)<{ $collapsed: boolean; $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  padding: ${SPACING.TWO} ${(p) => (p.$collapsed ? SPACING.TWO : SPACING.THREE)};
  justify-content: ${(p) => (p.$collapsed ? "center" : "flex-start")};
  border-radius: ${LAYOUT.RADIUS.MD};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${(p) => (p.$active ? FONTS.WEIGHT.MEDIUM : FONTS.WEIGHT.NORMAL)};
  color: white;
  outline: none;
  background-color: ${(p) => (p.$active ? "rgba(255, 255, 255, 0.15)" : "transparent")};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
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
  flex-shrink: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: ${SPACING.TWO};
`;

const CollapseToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.TWO};
  width: 100%;
  padding: ${SPACING.TWO};
  margin-bottom: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.MD};
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-size: ${FONTS.SIZE.SM};
  outline: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
`;

const ToggleSvg = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
`;

const UserPanel = styled.div<{ $collapsed: boolean }>`
  display: ${(p) => (p.$collapsed ? "flex" : "block")};
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.TWO};
  padding: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: rgba(255, 255, 255, 0.05);
  font-size: ${FONTS.SIZE.XS};
  color: rgba(255, 255, 255, 0.8);
`;

const UserMeta = styled.p`
  margin-bottom: ${SPACING.TWO};
  word-break: break-word;
`;

const UserName = styled.span`
  display: block;
  color: white;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
`;

const UserRole = styled.span`
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.7);
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
  user: { name?: string | null; email?: string | null; role: Role };
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
        <BrandLink href="/dashboard" onClick={onNavigate} $collapsed={navCollapsed} title="Mentora home">
          {navCollapsed ? "M" : "Mentora"}
        </BrandLink>
      </Brand>

      <Nav aria-label="Main">
        <NavLinks items={items} collapsed={navCollapsed} onNavigate={onNavigate} />
      </Nav>

      {user.role === "GUARDIAN" && wards && wards.length > 0 ? (
        <WardSelector wards={wards} collapsed={navCollapsed} />
      ) : null}

      <Footer>
        {showCollapseToggle ? (
          <CollapseToggle
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!navCollapsed}
            aria-label={navCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={navCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ToggleSvg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              {navCollapsed ? (
                <path strokeWidth="2" strokeLinecap="round" d="M9 5l7 7-7 7" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" d="M15 5l-7 7 7 7" />
              )}
            </ToggleSvg>
            {!navCollapsed ? <span>Collapse</span> : null}
          </CollapseToggle>
        ) : null}

        <UserPanel $collapsed={navCollapsed}>
          {!navCollapsed ? (
            <UserMeta>
              <UserName>{user.name ?? user.email}</UserName>
              <UserRole>{user.role}</UserRole>
            </UserMeta>
          ) : (
            <SrOnly>
              {user.name ?? user.email} · {user.role}
            </SrOnly>
          )}
          <SignOutButton compact={navCollapsed} />
        </UserPanel>
      </Footer>
    </Shell>
  );
}
