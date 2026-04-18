"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import * as React from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { APP_NAV } from "./appNavConfig";
import { AppSidebarChrome } from "./AppSidebarChrome";

const STORAGE_KEY = "mentora-sidebar-collapsed";
const LG = "(min-width: 1024px)";

export interface AppShellClientProps {
  user: { name?: string | null; email?: string | null; role: Role };
  children: React.ReactNode;
}

export function AppShellClient({ user, children }: AppShellClientProps) {
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
      } catch {
        /* ignore */
      }
    });
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
      } catch {
        /* ignore */
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
    <div className="flex min-h-dvh bg-background">
      <aside
        id="app-mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(100%,18rem)] flex-col bg-header text-white shadow-xl motion-reduce:transition-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-out lg:relative lg:z-0 lg:h-auto lg:min-h-dvh lg:max-w-none lg:translate-x-0 lg:shadow-none lg:transition-[width] motion-reduce:lg:transition-none ${
          navCollapsed ? "lg:w-16" : "lg:w-60"
        }`}
        aria-label="Sidebar"
      >
        <AppSidebarChrome
          items={items}
          navCollapsed={navCollapsed}
          showCollapseToggle={isLg}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onNavigate={closeMobile}
          user={user}
        />
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-header px-3 text-white sm:px-4 lg:hidden">
          <button
            ref={openButtonRef}
            type="button"
            tabIndex={isLg ? -1 : 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40"
            aria-expanded={mobileOpen}
            aria-controls="app-mobile-sidebar"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              {mobileOpen ? (
                <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
          <Link
            href="/dashboard"
            className="min-w-0 truncate text-center text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Mentora
          </Link>
          <div className="h-10 w-10 shrink-0" aria-hidden />
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
