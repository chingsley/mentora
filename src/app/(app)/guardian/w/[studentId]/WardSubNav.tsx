"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Nav = styled.nav`
  display: inline-flex;
  align-self: flex-start;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0.125rem;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  height: 2rem;
  display: inline-flex;
  align-items: center;
  border-radius: ${LAYOUT.RADIUS.SM};
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;

  ${(p) =>
    p.$active
      ? css`
          background-color: ${COLORS.HEADER};
          color: ${COLORS.WHITE};
        `
      : css`
          color: ${COLORS.HEADER};
          &:hover {
            background-color: rgba(23, 32, 51, 0.06);
          }
        `}
`;

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
    <Nav aria-label="Ward sections">
      {items.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          $active={isActive(pathname, item.href, base)}
        >
          {item.label}
        </NavLink>
      ))}
    </Nav>
  );
}

function isActive(pathname: string, href: string, base: string): boolean {
  if (href === base) {
    return (
      pathname === base ||
      pathname.startsWith(`${base}/classes`) ||
      pathname.startsWith(`${base}/teachers`)
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
