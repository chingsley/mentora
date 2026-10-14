"use client";

import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";
import { flushSync } from "react-dom";
import styled from "styled-components";
import { PageLoader } from "@/components/ui/PageLoader";
import { COLORS } from "@/constants/colors.constants";
import { LAYOUT } from "@/constants/layout.constants";

interface NavigationLoadingContextValue {
  beginNavigation: () => void;
  endNavigation: () => void;
  isNavigationLoading: boolean;
}

const NavigationLoadingContext = React.createContext<NavigationLoadingContextValue | null>(
  null,
);

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${LAYOUT.Z.NAVIGATION_PROGRESS};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${COLORS.NAVIGATION_LOADING_SCRIM};
  pointer-events: all;
`;

function resolveHref(href: string): URL {
  return new URL(href, window.location.href);
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

function isSameLocation(href: string, pathname: string, search: string): boolean {
  try {
    const target = resolveHref(href);
    const currentSearch = search.startsWith("?") ? search : search ? `?${search}` : "";
    const targetSearch = target.search || "";
    return target.pathname === pathname && targetSearch === currentSearch;
  } catch {
    return false;
  }
}

function NavigationLoadingRouteWatcher({ onRouteCommit }: { onRouteCommit: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  React.useEffect(() => {
    onRouteCommit();
  }, [pathname, searchKey, onRouteCommit]);

  return null;
}

export function useNavigationLoading(): NavigationLoadingContextValue {
  const ctx = React.useContext(NavigationLoadingContext);
  if (!ctx) {
    throw new Error("useNavigationLoading must be used within NavigationLoadingProvider");
  }
  return ctx;
}

export function NavigationLoadingProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = React.useState(false);

  const beginNavigation = React.useCallback(() => {
    flushSync(() => setActive(true));
  }, []);

  const endNavigation = React.useCallback(() => {
    setActive(false);
  }, []);

  const onRouteCommit = React.useCallback(() => {
    setActive(false);
  }, []);

  React.useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || !isInternalAppLink(anchor)) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        isSameLocation(href, window.location.pathname, window.location.search)
      ) {
        return;
      }

      beginNavigation();
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [beginNavigation]);

  React.useEffect(() => {
    if (!active) return;
    const timeoutId = window.setTimeout(() => endNavigation(), 30_000);
    return () => window.clearTimeout(timeoutId);
  }, [active, endNavigation]);

  const value = React.useMemo(
    () => ({
      beginNavigation,
      endNavigation,
      isNavigationLoading: active,
    }),
    [active, beginNavigation, endNavigation],
  );

  return (
    <NavigationLoadingContext.Provider value={value}>
      <React.Suspense fallback={null}>
        <NavigationLoadingRouteWatcher onRouteCommit={onRouteCommit} />
      </React.Suspense>
      {children}
      {active ? (
        <Overlay role="presentation">
          <PageLoader />
        </Overlay>
      ) : null}
    </NavigationLoadingContext.Provider>
  );
}
