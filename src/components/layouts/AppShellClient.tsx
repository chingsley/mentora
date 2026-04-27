"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { APP_NAV } from "./appNavConfig";
import { AppSidebarChrome } from "./AppSidebarChrome";
import type { WardOption } from "./WardSelector";

const STORAGE_KEY = "mentora-sidebar-collapsed";
const LG = "(min-width: 1024px)";

export interface AppShellClientProps {
  user: { name?: string | null; email?: string | null; role: Role; };
  wards?: WardOption[];
  children: React.ReactNode;
}

const Root = styled.div`
  display: flex;
  min-height: 100dvh;
  background-color: ${COLORS.BACKGROUND};
`;

const Sidebar = styled.aside<{ $open: boolean; $collapsed: boolean; }>`
  position: fixed;
  inset-block: 0;
  left: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: min(100%, 18rem);
  background-color: ${COLORS.HEADER};
  color: white;
  box-shadow: ${LAYOUT.SHADOW.XL};
  transform: translateX(${(p) => (p.$open ? "0" : "-100%")});
  transition: transform 0.2s ease-out;

  ${LAYOUT.MEDIA.REDUCED_MOTION} {
    transition: none;
  }

  ${LAYOUT.MEDIA.LG} {
    position: relative;
    z-index: 0;
    height: auto;
    min-height: 100dvh;
    max-width: none;
    transform: none;
    box-shadow: none;
    width: ${(p) => (p.$collapsed ? LAYOUT.SIDEBAR_WIDTH_COLLAPSED : LAYOUT.SIDEBAR_WIDTH)};
    transition: width 0.2s ease-out;
  }
`;

const MobileBackdrop = styled.button`
  position: fixed;
  inset: 0;
  z-index: 40;
  background-color: rgba(0, 0, 0, 0.5);
  border: none;

  ${LAYOUT.MEDIA.LG} {
    display: none;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const MobileHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  height: 3.5rem;
  flex-shrink: 0;
  padding: 0 ${SPACING.THREE};
  background-color: ${COLORS.HEADER};
  color: white;
  border-bottom: 1px solid ${COLORS.BORDER};

  ${LAYOUT.MEDIA.SM} {
    padding: 0 ${SPACING.FOUR};
  }

  ${LAYOUT.MEDIA.LG} {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: ${LAYOUT.RADIUS.MD};
  background: transparent;
  color: inherit;
  outline: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
`;

const MobileLogo = styled(Link)`
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: ${FONTS.SIZE.BASE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: inherit;
  outline: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
  }
`;

const Spacer = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
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

const HamburgerSvg = styled.svg`
  width: 1.5rem;
  height: 1.5rem;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: ${SPACING.SIX} ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    padding: ${SPACING.TEN} ${SPACING.SIX};
  }
`;

export function AppShellClient({ user, wards, children }: AppShellClientProps) {
  const items = APP_NAV.filter((i) => i.roles.includes(user.role));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const isLg = useMediaQuery(LG);
  const navCollapsed = collapsed && isLg;
  const openButtonRef = React.useRef<HTMLButtonElement>(null);
  const hadOpenedMobile = React.useRef(false);

  React.useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
      } catch (error) {
        console.error(error);
      }
    });
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
      } catch (error) {
        console.error(error);
      }
    });
  }, [collapsed]);

  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    if (mobileOpen) hadOpenedMobile.current = true;
    else if (hadOpenedMobile.current && !isLg) openButtonRef.current?.focus();
  }, [mobileOpen, isLg]);

  const pathname = usePathname();
  React.useEffect(() => {
    void Promise.resolve().then(() => setMobileOpen(false));
  }, [pathname, isLg]);

  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  return (
    <Root>
      <Sidebar
        id="app-mobile-sidebar"
        $open={mobileOpen}
        $collapsed={navCollapsed}
        aria-label="Sidebar"
      >
        <AppSidebarChrome
          items={items}
          navCollapsed={navCollapsed}
          showCollapseToggle={isLg}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onNavigate={closeMobile}
          user={user}
          wards={wards}
        />
      </Sidebar>

      {mobileOpen ? (
        <MobileBackdrop type="button" aria-label="Close menu" onClick={closeMobile} />
      ) : null}

      <Body>
        <MobileHeader>
          <MobileMenuButton
            ref={openButtonRef}
            type="button"
            tabIndex={isLg ? -1 : 0}
            aria-expanded={mobileOpen}
            aria-controls="app-mobile-sidebar"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <SrOnly>{mobileOpen ? "Close menu" : "Open menu"}</SrOnly>
            <HamburgerSvg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              {mobileOpen ? (
                <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </HamburgerSvg>
          </MobileMenuButton>
          <MobileLogo href="/dashboard">Mentora</MobileLogo>
          <Spacer aria-hidden />
        </MobileHeader>

        <Main>{children}</Main>
      </Body>
    </Root>
  );
}
