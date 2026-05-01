"use client";

import * as React from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export type TabsVisualVariant = "default" | "underline";

interface TabsContextValue {
  value: string;
  onValueChange: (next: string) => void;
  variant: TabsVisualVariant;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext(component: string): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`${component} must be used within <Tabs>`);
  return ctx;
}

const List = styled.div<{ $underline: boolean; }>`
  display: flex;
  flex: 1;
  min-width: 0;
  justify-content: ${(p) => (p.$underline ? "center" : "flex-start")};
  gap: ${(p) => (p.$underline ? SPACING.ONE : SPACING.ONE)};
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: ${(p) => (p.$underline ? "none" : `1px solid ${COLORS.BORDER}`)};

  ${LAYOUT.MEDIA.SM} {
    flex-wrap: ${(p) => (p.$underline ? "nowrap" : "wrap")};
    overflow-x: ${(p) => (p.$underline ? "auto" : "visible")};
    scroll-snap-type: ${(p) => (p.$underline ? "x mandatory" : "none")};
  }
`;

const TabButton = styled.button<{ $active: boolean; $underline: boolean; }>`
  flex: 0 0 auto;
  scroll-snap-align: start;
  border: none;
  padding: ${SPACING.THREE} ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
  white-space: nowrap;
  cursor: pointer;
  outline: none;

  ${(p) =>
    p.$underline
      ? css`
          border-radius: 0;
          margin-bottom: -1px;
          border-bottom: 2px solid transparent;
          ${p.$active
          ? css`
                color: ${COLORS.HEADER};
                border-bottom-color: ${COLORS.SIDEBAR_ACCENT};
                font-weight: ${FONTS.WEIGHT.SEMIBOLD};
              `
          : css`
                &:hover {
                  color: ${COLORS.HEADER};
                }
              `}
        `
      : css`
          border-radius: ${LAYOUT.RADIUS.MD};
          border: 1px solid transparent;
          ${p.$active
          ? css`
                border-color: ${COLORS.BORDER};
                color: ${COLORS.HEADER};
              `
          : css`
                &:hover {
                  color: ${COLORS.HEADER};
                }
              `}
        `}
`;

const Panel = styled.div`
  min-width: 0;
`;

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Underline style for dashboard-style tab strips */
  variant?: TabsVisualVariant;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, variant = "default", children }: TabsProps) {
  const ctx = React.useMemo(() => ({ value, onValueChange, variant }), [value, onValueChange, variant]);
  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

export interface TabsListProps {
  "aria-label"?: string;
  children: React.ReactNode;
}

export function TabsList({ "aria-label": ariaLabel = "Profile sections", children }: TabsListProps) {
  const { value, onValueChange, variant } = useTabsContext("TabsList");
  const listRef = React.useRef<HTMLDivElement>(null);
  const underline = variant === "underline";

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const root = listRef.current;
    if (!root) return;
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    if (buttons.length === 0) return;
    const currentIdx = buttons.findIndex((b) => b.dataset.tabValue === value);
    const idx = currentIdx === -1 ? 0 : currentIdx;
    const delta = e.key === "ArrowRight" ? 1 : -1;
    const nextIdx = (idx + delta + buttons.length) % buttons.length;
    const next = buttons[nextIdx]?.dataset.tabValue;
    if (next) {
      onValueChange(next);
      if (typeof globalThis.requestAnimationFrame === "function") {
        globalThis.requestAnimationFrame(() => buttons[nextIdx]?.focus());
      } else {
        buttons[nextIdx]?.focus();
      }
    }
  }

  return (
    <List
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      $underline={underline}
    >
      {children}
    </List>
  );
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

export function TabsTrigger({ value: tabValue, children }: TabsTriggerProps) {
  const { value, onValueChange, variant } = useTabsContext("TabsTrigger");
  const selected = value === tabValue;
  const underline = variant === "underline";
  return (
    <TabButton
      type="button"
      role="tab"
      data-tab-value={tabValue}
      id={`tab-${tabValue}`}
      aria-selected={selected}
      aria-controls={`panel-${tabValue}`}
      tabIndex={selected ? 0 : -1}
      $active={selected}
      $underline={underline}
      onClick={() => onValueChange(tabValue)}
    >
      {children}
    </TabButton>
  );
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

export function TabsContent({ value: tabValue, children }: TabsContentProps) {
  const { value } = useTabsContext("TabsContent");
  if (value !== tabValue) return null;
  return (
    <Panel
      role="tabpanel"
      id={`panel-${tabValue}`}
      aria-labelledby={`tab-${tabValue}`}
    >
      {children}
    </Panel>
  );
}
