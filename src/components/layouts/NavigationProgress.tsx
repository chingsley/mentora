"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import styled, { keyframes } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const indeterminate = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
`;

const Track = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${LAYOUT.Z.NAVIGATION_PROGRESS};
  height: ${SPACING.ONE};
  overflow: hidden;
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  pointer-events: none;
`;

const Bar = styled.div`
  height: 100%;
  width: 35%;
  background-color: ${COLORS.ACTION_PRIMARY};
  animation: ${indeterminate} 1.1s ease-in-out infinite;

  ${LAYOUT.MEDIA.REDUCED_MOTION} {
    animation: none;
    width: 100%;
    opacity: 0.65;
  }
`;

function isSameRoute(href: string, pathname: string): boolean {
  const path = href.split("?")[0]?.split("#")[0] ?? href;
  return path === pathname;
}

function isInternalAppLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (anchor.target === "_blank" || anchor.download !== "") return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Thin top bar during client navigations while the next segment’s `loading.tsx` resolves.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    void Promise.resolve().then(() => setActive(false));
  }, [pathname]);

  React.useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || !isInternalAppLink(anchor)) return;

      const href = anchor.getAttribute("href");
      if (!href || isSameRoute(href, pathname)) return;

      setActive(true);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  if (!active) return null;

  return (
    <Track role="progressbar" aria-hidden>
      <Bar />
    </Track>
  );
}
