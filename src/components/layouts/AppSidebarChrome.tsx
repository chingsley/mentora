"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import type { AppNavItem } from "./appNavConfig";
import { AppNavIcon } from "./AppNavIcon";
import { SignOutButton } from "./SignOutButton";

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
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isNavActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-md py-2 text-sm outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 motion-reduce:transition-none ${
                collapsed ? "justify-center px-2" : "px-3"
              } ${active ? "bg-white/15 font-medium" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <AppNavIcon name={item.icon} />
              {!collapsed ? <span className="min-w-0 truncate">{item.label}</span> : null}
              {collapsed ? <span className="sr-only">{item.label}</span> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export interface AppSidebarChromeProps {
  items: AppNavItem[];
  navCollapsed: boolean;
  showCollapseToggle: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
  user: { name?: string | null; email?: string | null; role: Role };
}

export function AppSidebarChrome({
  items,
  navCollapsed,
  showCollapseToggle,
  onToggleCollapse,
  onNavigate,
  user,
}: AppSidebarChromeProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={`flex shrink-0 items-center border-b border-white/10 py-4 ${
          navCollapsed ? "justify-center px-2" : "px-4"
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={`font-semibold tracking-tight text-white outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/40 ${
            navCollapsed ? "flex h-9 w-9 items-center justify-center rounded-md text-lg" : "text-lg"
          }`}
          title="Mentora home"
        >
          {navCollapsed ? "M" : "Mentora"}
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-4" aria-label="Main">
        <NavLinks items={items} collapsed={navCollapsed} onNavigate={onNavigate} />
      </nav>

      <div className="shrink-0 border-t border-white/10 p-2">
        {showCollapseToggle ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm text-white/90 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 motion-reduce:transition-none"
            aria-expanded={!navCollapsed}
            aria-label={navCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={navCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className="h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden
            >
              {navCollapsed ? (
                <path strokeWidth="2" strokeLinecap="round" d="M9 5l7 7-7 7" />
              ) : (
                <path strokeWidth="2" strokeLinecap="round" d="M15 5l-7 7 7 7" />
              )}
            </svg>
            {!navCollapsed ? <span>Collapse</span> : null}
          </button>
        ) : null}

        <div
          className={`rounded-md bg-white/5 px-2 py-2 text-xs text-white/80 ${
            navCollapsed ? "flex flex-col items-center gap-2" : ""
          }`}
        >
          {!navCollapsed ? (
            <p className="mb-2 break-words">
              <span className="block font-medium text-white">{user.name ?? user.email}</span>
              <span className="uppercase tracking-wide text-white/70">{user.role}</span>
            </p>
          ) : (
            <span className="sr-only">
              {user.name ?? user.email} · {user.role}
            </span>
          )}
          <SignOutButton compact={navCollapsed} />
        </div>
      </div>
    </div>
  );
}
