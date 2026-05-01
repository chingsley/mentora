"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { ChevronDown } from "lucide-react";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface WardOption {
  studentProfileId: string;
  name: string;
  image: string | null;
}

export interface WardSelectorProps {
  wards: WardOption[];
  collapsed?: boolean;
}

const CollapsedWrap = styled.div`
  border-top: 1px solid ${COLORS.BORDER};
  padding: ${SPACING.TWO} 0;
`;

const CollapsedRow = styled.div`
  display: flex;
  justify-content: center;
`;

const Avatar = styled.div<{ $size: "sm" | "md" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(p) => (p.$size === "sm" ? "1.5rem" : "2.25rem")};
  height: ${(p) => (p.$size === "sm" ? "1.5rem" : "2.25rem")};
  flex-shrink: 0;
  border-radius: 9999px;
  background-color: ${COLORS.SIDEBAR_AVATAR_BG};
  color: ${COLORS.HEADER};
  text-transform: uppercase;
  font-size: ${(p) => (p.$size === "sm" ? "0.6875rem" : FONTS.SIZE.XS)};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
`;

const ExpandedWrap = styled.div`
  border-top: 1px solid ${COLORS.BORDER};
  padding: ${SPACING.THREE};
`;

const Eyebrow = styled.p`
  margin-bottom: ${SPACING.ONE};
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${COLORS.SIDEBAR_ROLE};
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};
  width: 100%;
  padding: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.SIDEBAR_HOVER};
  color: ${COLORS.HEADER};
  font-size: ${FONTS.SIZE.SM};
  text-align: left;
  outline: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: ${COLORS.SIDEBAR_ACTIVE_BG};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${COLORS.SIDEBAR_FOCUS_RING};
  }
`;

const TriggerLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TriggerCaret = styled(ChevronDown)`
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  color: ${COLORS.SIDEBAR_MUTED};
`;

const List = styled.ul`
  margin-top: ${SPACING.ONE};
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: ${SPACING.ONE};
  max-height: 16rem;
  overflow-y: auto;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  box-shadow: ${LAYOUT.SHADOW.SM};
`;

const Option = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};
  width: 100%;
  padding: 0.375rem ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.MD};
  text-align: left;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${(p) => (p.$selected ? FONTS.WEIGHT.MEDIUM : FONTS.WEIGHT.NORMAL)};
  color: ${(p) => (p.$selected ? COLORS.HEADER : COLORS.SIDEBAR_MUTED)};
  background-color: ${(p) => (p.$selected ? COLORS.SIDEBAR_ACTIVE_BG : "transparent")};
  outline: none;

  &:hover {
    background-color: ${COLORS.SIDEBAR_HOVER};
    color: ${COLORS.HEADER};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${COLORS.SIDEBAR_FOCUS_RING};
  }
`;

export function WardSelector({ wards, collapsed = false }: WardSelectorProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const params = useParams<{ studentId?: string }>();
  const active = params?.studentId ?? wards[0]?.studentProfileId;
  const current = wards.find((w) => w.studentProfileId === active);

  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (wards.length === 0) return null;

  function selectWard(studentProfileId: string) {
    setOpen(false);
    const prefix = `/guardian/w/`;
    if (pathname.startsWith(prefix) && active) {
      const rest = pathname.slice(prefix.length);
      const slash = rest.indexOf("/");
      const tail = slash === -1 ? "" : rest.slice(slash);
      router.push(`${prefix}${studentProfileId}${tail}`);
    } else {
      router.push(`${prefix}${studentProfileId}`);
    }
    router.refresh();
  }

  if (collapsed) {
    return (
      <CollapsedWrap aria-label="Ward selector">
        <CollapsedRow>
          <Avatar $size="md" title={current ? `Ward: ${current.name}` : "Select a ward"}>
            {current ? initials(current.name) : "?"}
          </Avatar>
        </CollapsedRow>
      </CollapsedWrap>
    );
  }

  return (
    <ExpandedWrap ref={containerRef}>
      <Eyebrow>Viewing ward</Eyebrow>
      <Trigger
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Avatar $size="sm">{current ? initials(current.name) : "?"}</Avatar>
        <TriggerLabel>{current?.name ?? "Select a ward"}</TriggerLabel>
        <TriggerCaret aria-hidden />
      </Trigger>
      {open ? (
        <List role="listbox">
          {wards.map((w) => {
            const selected = w.studentProfileId === active;
            return (
              <li key={w.studentProfileId}>
                <Option
                  type="button"
                  role="option"
                  aria-selected={selected}
                  $selected={selected}
                  onClick={() => selectWard(w.studentProfileId)}
                >
                  <Avatar $size="sm">{initials(w.name)}</Avatar>
                  <TriggerLabel>{w.name}</TriggerLabel>
                </Option>
              </li>
            );
          })}
        </List>
      ) : null}
    </ExpandedWrap>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase() || "?";
}
