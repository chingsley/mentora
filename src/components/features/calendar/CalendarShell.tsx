"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import styled, { css } from "styled-components";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { Button } from "@/components/ui/Button";
import { DayGrid } from "./DayGrid";
import { MonthGrid } from "./MonthGrid";
import { WeekGrid, startOfISOWeek } from "./WeekGrid";
import type { CalendarEntry, CalendarEntryClickHandler, CalendarOccurrenceLookup, CalendarTileColorMode, CalendarView } from "./types";

export interface CalendarShellProps {
  entries: CalendarEntry[];
  initialView?: CalendarView;
  tileColorMode?: CalendarTileColorMode;
  occurrenceLookup?: CalendarOccurrenceLookup;
  onEntryClick?: CalendarEntryClickHandler;
  onEmptySlotClick?: (info: { dayOfWeek: DayOfWeek; minutes: number; date: Date }) => void;
  emptyState?: React.ReactNode;
}

const VIEWS: Array<{ id: CalendarView; label: string }> = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  padding-bottom: ${SPACING.ONE};
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.ONE};
`;

const toolbarControlChrome = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.FOREGROUND};
  color: ${COLORS.HEADER};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
    border-color: ${COLORS.SURFACE_NEUTRAL_BORDER_HOVER};
  }
`;

const IconButton = styled.button`
  ${toolbarControlChrome}
  padding: ${SPACING.TWO};
`;

const RangeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.TWO};
  border: none;
  background: ${COLORS.TRANSPARENT};
  padding: ${SPACING.ONE} ${SPACING.TWO};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  cursor: default;
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const ViewSelectWrap = styled.div`
  position: relative;
  display: inline-flex;
`;

const ViewSelectButton = styled.button`
  ${toolbarControlChrome}
  gap: ${SPACING.TWO};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const ViewMenu = styled.div`
  position: absolute;
  top: calc(100% + ${SPACING.ONE});
  right: 0;
  z-index: ${LAYOUT.Z.STICKY};
  min-width: calc(${SPACING.TEN} * 1.5);
  overflow: hidden;
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.FOREGROUND};
  box-shadow: ${LAYOUT.SHADOW.MD};
`;

const ViewMenuItem = styled.button<{ $active: boolean }>`
  display: block;
  width: 100%;
  border: none;
  background-color: ${(p) => (p.$active ? COLORS.CALENDAR_TODAY_COLUMN_BG : COLORS.FOREGROUND)};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  text-align: left;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${(p) => (p.$active ? FONTS.WEIGHT.SEMIBOLD : FONTS.WEIGHT.NORMAL)};
  color: ${COLORS.HEADER};
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
  }
`;

const EmptyBanner = styled.div`
  margin-bottom: ${SPACING.THREE};
`;

export function CalendarShell({
  entries,
  initialView = "week",
  tileColorMode = "capacity",
  occurrenceLookup,
  onEntryClick,
  onEmptySlotClick,
  emptyState,
}: CalendarShellProps) {
  const [view, setView] = React.useState<CalendarView>(initialView);
  const [anchor, setAnchor] = React.useState<Date>(() => new Date());
  const [viewMenuOpen, setViewMenuOpen] = React.useState(false);
  const viewMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!viewMenuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!viewMenuRef.current?.contains(event.target as Node)) {
        setViewMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [viewMenuOpen]);

  function shift(direction: -1 | 1) {
    const next = new Date(anchor);
    if (view === "day") next.setDate(next.getDate() + direction);
    else if (view === "week") next.setDate(next.getDate() + direction * 7);
    else next.setMonth(next.getMonth() + direction);
    setAnchor(next);
  }

  function goToday() {
    setAnchor(new Date());
  }

  const title = formatRange(view, anchor);
  const activeViewLabel = VIEWS.find((item) => item.id === view)?.label ?? "Week";
  const allowEmptyGrid = Boolean(onEmptySlotClick);
  const showGrid = entries.length > 0 || allowEmptyGrid;

  return (
    <Wrap>
      <Toolbar>
        <NavGroup>
          <IconButton type="button" onClick={() => shift(-1)} aria-label="Previous">
            <ChevronLeft size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
          </IconButton>
          <IconButton type="button" onClick={() => shift(1)} aria-label="Next">
            <ChevronRight size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
          </IconButton>
          <Button type="button" variant="secondary" onClick={goToday}>
            Today
          </Button>
          <RangeButton type="button" aria-live="polite">
            {title}
            <ChevronDown size={ICON_SIZE.XS} strokeWidth={ICON_STROKE.NORMAL} color={COLORS.MUTED_FOREGROUND} />
          </RangeButton>
        </NavGroup>

        <ViewSelectWrap ref={viewMenuRef}>
          <ViewSelectButton
            type="button"
            aria-haspopup="listbox"
            aria-expanded={viewMenuOpen}
            onClick={() => setViewMenuOpen((open) => !open)}
          >
            <CalendarDays size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.NORMAL} />
            {activeViewLabel}
            <ChevronDown size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.NORMAL} />
          </ViewSelectButton>
          {viewMenuOpen ? (
            <ViewMenu role="listbox" aria-label="Calendar view">
              {VIEWS.map((item) => (
                <ViewMenuItem
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={item.id === view}
                  $active={item.id === view}
                  onClick={() => {
                    setView(item.id);
                    setViewMenuOpen(false);
                  }}
                >
                  {item.label}
                </ViewMenuItem>
              ))}
            </ViewMenu>
          ) : null}
        </ViewSelectWrap>
      </Toolbar>

      {entries.length === 0 && emptyState ? (
        allowEmptyGrid ? <EmptyBanner>{emptyState}</EmptyBanner> : <div>{emptyState}</div>
      ) : null}

      {showGrid && view === "day" ? (
        <DayGrid
          entries={entries}
          date={anchor}
          tileColorMode={tileColorMode}
          occurrenceLookup={occurrenceLookup}
          onEntryClick={onEntryClick}
          onEmptySlotClick={onEmptySlotClick}
        />
      ) : showGrid && view === "week" ? (
        <WeekGrid
          entries={entries}
          anchorDate={anchor}
          tileColorMode={tileColorMode}
          occurrenceLookup={occurrenceLookup}
          onEntryClick={onEntryClick}
          onEmptySlotClick={onEmptySlotClick}
        />
      ) : showGrid ? (
        <MonthGrid
          entries={entries}
          anchorDate={anchor}
          tileColorMode={tileColorMode}
          occurrenceLookup={occurrenceLookup}
          onEntryClick={onEntryClick}
          onDayClick={(date) => {
            setAnchor(date);
            setView("day");
          }}
        />
      ) : null}
    </Wrap>
  );
}

function formatRange(view: CalendarView, anchor: Date): string {
  if (view === "day") {
    const day = String(anchor.getDate()).padStart(2, "0");
    const month = anchor.toLocaleDateString(undefined, { month: "long" });
    return `${day} ${month}, ${anchor.getFullYear()}`;
  }
  if (view === "week") {
    const start = startOfISOWeek(anchor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const startDay = String(start.getDate()).padStart(2, "0");
    const endDay = String(end.getDate()).padStart(2, "0");
    const month = end.toLocaleDateString(undefined, { month: "long" });
    return `${startDay}–${endDay} ${month}, ${end.getFullYear()}`;
  }
  return anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
