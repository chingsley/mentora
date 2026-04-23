"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface WardSubNavProps {
  studentId: string;
}

export function WardSubNav({ studentId }: WardSubNavProps) {
  const pathname = usePathname() ?? "";
  const base = `/guardian/w/${studentId}`;
  const items = [
    { href: base, label: "Profile" },
    { href: `${base}/grades`, label: "Grades" },
  ];

  return (
    <nav
      aria-label="Ward sections"
      className="inline-flex self-start rounded-md border border-border bg-foreground p-0.5"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href, base);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`h-8 rounded-sm px-3 text-xs font-medium transition-colors ${
              active ? "bg-header text-white" : "text-header hover:bg-header/[0.06]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function isActive(pathname: string, href: string, base: string): boolean {
  if (href === base) {
    return pathname === base || pathname.startsWith(`${base}/classes`) || pathname.startsWith(`${base}/teachers`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
