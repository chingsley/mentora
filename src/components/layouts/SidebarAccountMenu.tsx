"use client";

import { ChevronDown, Info, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import * as React from "react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { signOutAction } from "./actions";

const Root = styled.div`
  position: relative;
  width: 100%;
`;

const TriggerButton = styled(Button) <{ $collapsed: boolean; }>`
  width: 100%;
  display: inline-flex;

  /* \`Button\` wraps children in an inner span — stretch it so space-between separates label vs chevron */
  & > span:first-child {
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    justify-content: ${(p) => (p.$collapsed ? "center" : "space-between")};
    gap: ${SPACING.THREE};
  }

  border-radius: ${LAYOUT.RADIUS.FULL};
  padding: ${(p) => (p.$collapsed ? SPACING.TWO : `${SPACING.TWO} ${SPACING.FOUR}`)};
  min-height: ${SPACING.TEN};
`;

const MenuChevron = styled(ChevronDown) <{ $open: boolean; }>`
  flex-shrink: 0;
  transform: ${(p) => (p.$open ? "rotate(180deg)" : "none")};
  transition: transform 0.2s ease;

  ${LAYOUT.MEDIA.REDUCED_MOTION} {
    transition: none;
  }
`;

const TriggerLeft = styled.span`
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: flex-start;
  gap: ${SPACING.THREE};
`;

const UserStack = styled.span`
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
`;

const UserNameLine = styled.span`
  max-width: 100%;
  overflow: hidden;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.BUTTON_SECONDARY_TEXT};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Avatar = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${SPACING.EIGHT};
  height: ${SPACING.EIGHT};
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.SIDEBAR_AVATAR_BG};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const iconMenuItemCss = css`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: ${SPACING.TWELVE};
  padding: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.MD};
  color: ${COLORS.HEADER};
  outline: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${COLORS.SIDEBAR_FOCUS_RING};
  }
`;

const MenuIconLink = styled(Link) <{ $labeled: boolean; }>`
  ${iconMenuItemCss}
  justify-content: ${(p) => (p.$labeled ? "flex-start" : "center")};
  gap: ${(p) => (p.$labeled ? SPACING.THREE : "0")};
  background: ${COLORS.TRANSPARENT};
  text-decoration: none;
`;

const MenuSignOutIconButton = styled.button<{ $labeled: boolean; }>`
  ${iconMenuItemCss}
  justify-content: ${(p) => (p.$labeled ? "flex-start" : "center")};
  gap: ${(p) => (p.$labeled ? SPACING.THREE : "0")};
  border: none;
  background: ${COLORS.TRANSPARENT};
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const MenuItemLabel = styled.span`
  flex: 1;
  min-width: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  text-align: left;
`;

const MenuSheet = styled.div<{ $open: boolean; }>`
  position: absolute;
  bottom: calc(100% + ${LAYOUT.SIDEBAR_FOOTER_INSET_INLINE});
  left: calc(-1 * ${LAYOUT.SIDEBAR_FOOTER_INSET_INLINE});
  z-index: ${LAYOUT.Z.MODAL};
  display: flex;
  box-sizing: border-box;
  width: calc(100% + 2 * ${LAYOUT.SIDEBAR_FOOTER_INSET_INLINE});
  flex-direction: column;
  gap: ${SPACING.ONE};
  padding: ${SPACING.TWO};
  border-top: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transform: translateY(${(p) => (p.$open ? "0" : SPACING.THREE)});
  visibility: ${(p) => (p.$open ? "visible" : "hidden")};
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    visibility 0.2s ease;

  max-height: min(60vh, 20rem);
  overflow-x: hidden;
  overflow-y: auto;

  ${LAYOUT.MEDIA.REDUCED_MOTION} {
    transform: none;
    transition: opacity 0.15s ease, visibility 0.15s ease;
  }
`;

const SignOutWrap = styled.div`
  margin-top: ${SPACING.ONE};
  padding-top: ${SPACING.TWO};
  border-top: 1px solid ${COLORS.BORDER};
`;

function initialsFromName(name: string | null | undefined, email: string | null | undefined): string {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase().slice(0, 2);
  }
  return source.slice(0, 2).toUpperCase();
}

export interface SidebarAccountMenuProps {
  user: { name?: string | null; email?: string | null; role: Role; };
  navCollapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarAccountMenu({ user, navCollapsed, onNavigate }: SidebarAccountMenuProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isSigningOut, startSignOut] = React.useTransition();

  const userLabel = user.name?.trim() || user.email?.trim() || "Account";
  const initials = initialsFromName(user.name, user.email);

  React.useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function closeAndNavigate() {
    setOpen(false);
    onNavigate?.();
  }

  function handleSignOut() {
    startSignOut(async () => {
      await signOutAction();
      router.push("/");
      router.refresh();
    });
  }

  const labeledMenu = !navCollapsed;

  return (
    <Root ref={rootRef}>
      <TriggerButton
        type="button"
        variant="secondary"
        $collapsed={navCollapsed}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${userLabel}`}
        id="sidebar-account-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        {navCollapsed ? (
          <Avatar aria-hidden>{initials}</Avatar>
        ) : (
          <TriggerLeft>
            <Avatar aria-hidden>{initials}</Avatar>
            <UserStack>
              <UserNameLine>{userLabel}</UserNameLine>
            </UserStack>
          </TriggerLeft>
        )}
        {!navCollapsed ? (
          <MenuChevron
            $open={open}
            size={ICON_SIZE.SM}
            strokeWidth={ICON_STROKE.MEDIUM}
            color={ICON_THEME.INLINE_MUTED}
            aria-hidden
          />
        ) : null}
      </TriggerButton>

      <MenuSheet
        $open={open}
        role="menu"
        aria-labelledby="sidebar-account-trigger"
        id="sidebar-account-menu"
      >
        <MenuIconLink
          role="menuitem"
          href="/profile"
          $labeled={labeledMenu}
          aria-label={labeledMenu ? undefined : "Settings"}
          title={labeledMenu ? undefined : "Settings"}
          onClick={closeAndNavigate}
        >
          <Settings size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} color={ICON_THEME.INLINE_MUTED} aria-hidden />
          {labeledMenu ? <MenuItemLabel>Settings</MenuItemLabel> : null}
        </MenuIconLink>
        <MenuIconLink
          role="menuitem"
          href="/"
          $labeled={labeledMenu}
          aria-label={labeledMenu ? undefined : "About us"}
          title={labeledMenu ? undefined : "About us"}
          onClick={closeAndNavigate}
        >
          <Info size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} color={ICON_THEME.INLINE_MUTED} aria-hidden />
          {labeledMenu ? <MenuItemLabel>About us</MenuItemLabel> : null}
        </MenuIconLink>
        <SignOutWrap role="none">
          <MenuSignOutIconButton
            type="button"
            role="menuitem"
            $labeled={labeledMenu}
            aria-label={isSigningOut ? "Signing out" : labeledMenu ? undefined : "Logout"}
            title={labeledMenu ? undefined : "Logout"}
            disabled={isSigningOut}
            onClick={() => {
              setOpen(false);
              handleSignOut();
            }}
          >
            <LogOut size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} color={ICON_THEME.INLINE_MUTED} aria-hidden />
            {labeledMenu ? <MenuItemLabel>Logout</MenuItemLabel> : null}
          </MenuSignOutIconButton>
        </SignOutWrap>
      </MenuSheet>
    </Root>
  );
}
