"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { signOutAction } from "./actions";

export interface SignOutButtonProps {
  /** Icon-only control for narrow sidebars (still exposes an accessible name). */
  compact?: boolean;
}

const Base = styled.button<{ $compact: boolean }>`
  display: ${(p) => (p.$compact ? "flex" : "block")};
  align-items: center;
  justify-content: ${(p) => (p.$compact ? "center" : "flex-start")};
  width: ${(p) => (p.$compact ? "2.25rem" : "100%")};
  height: ${(p) => (p.$compact ? "2.25rem" : "auto")};
  flex-shrink: ${(p) => (p.$compact ? 0 : "initial")};
  padding: ${(p) => (p.$compact ? "0" : `${SPACING.HALF} ${SPACING.THREE}`)};
  border-radius: ${LAYOUT.RADIUS.MD};
  background: transparent;
  color: ${COLORS.SIDEBAR_MUTED};
  font-size: ${FONTS.SIZE.SM};
  text-align: left;
  outline: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${COLORS.SIDEBAR_HOVER};
    color: ${COLORS.HEADER};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${COLORS.SIDEBAR_FOCUS_RING};
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const IconSvg = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
`;

export function SignOutButton({ compact = false }: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  return (
    <Base
      type="button"
      $compact={compact}
      aria-label={compact ? (isPending ? "Signing out" : "Sign out") : undefined}
      onClick={() => {
        startTransition(async () => {
          await signOutAction();
          router.push("/");
          router.refresh();
        });
      }}
      disabled={isPending}
    >
      {compact ? (
        <IconSvg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 18l-6-6 6-6M5 12h14"
          />
        </IconSvg>
      ) : isPending ? (
        "Signing out..."
      ) : (
        "Sign out"
      )}
    </Base>
  );
}
