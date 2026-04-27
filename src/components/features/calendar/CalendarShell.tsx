"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { Button } from "@/components/ui/Button";
import { DayGrid } from "./DayGrid";
import { MonthGrid } from "./MonthGrid";
import { WeekGrid } from "./WeekGrid";
import type { CalendarEntry, CalendarView } from "./types";

export interface CalendarShellProps {
  entries: CalendarEntry[];
  initialView?: CalendarView;
  onEntryClick?: (entry: CalendarEntry) => void;
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
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const Title = styled.h2`
  margin-left: ${SPACING.TWO};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE.BASE};
  }
`;

const ViewTabs = styled.div`
  display: inline-flex;
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  border-radius: ${LAYOUT.RADIUS.MD};
  padding: 0.125rem;
`;

const ViewTab = styled.button<{ $active: boolean }>`
  height: 2rem;
  padding: 0 ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.SM};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  border: none;
  background-color: ${(p) => (p.$active ? COLORS.HEADER : "transparent")};
  color: ${(p) => (p.$active ? COLORS.WHITE : COLORS.HEADER)};
  transition: background-color 0.15s ease;

  &:hover:not([aria-selected="true"]) {
    background-color: rgba(23, 32, 51, 0.06);
  }
`;

const Caret = styled(ChevronLeft)`
  width: 1rem;
  height: 1rem;
`;

const CaretRight = styled(ChevronRight)`
  width: 1rem;
  height: 1rem;
`;

export function CalendarShell({
  entries,
  initialView = "week",
  onEntryClick,
  onEmptySlotClick,
  emptyState,
}: CalendarShellProps) {
  const [view, setView] = React.useState<CalendarView>(initialView);
  const [anchor, setAnchor] = React.useState<Date>(() => new Date());

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

  return (
    <Wrap>
      <Toolbar>
        <NavGroup>
          <Button type="button" variant="ghost" size="sm" onClick={() => shift(-1)} aria-label="Previous">
            <Caret aria-hidden />
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => shift(1)} aria-label="Next">
            <CaretRight aria-hidden />
          </Button>
          <Title>{title}</Title>
        </NavGroup>
        <ViewTabs role="tablist" aria-label="Calendar view">
          {VIEWS.map((v) => {
            const active = v.id === view;
            return (
              <ViewTab
                key={v.id}
                type="button"
                role="tab"
                aria-selected={active}
                $active={active}
                onClick={() => setView(v.id)}
              >
                {v.label}
              </ViewTab>
            );
          })}
        </ViewTabs>
      </Toolbar>

      {entries.length === 0 && emptyState ? (
        <div>{emptyState}</div>
      ) : view === "day" ? (
        <DayGrid
          entries={entries}
          date={anchor}
          onEntryClick={onEntryClick}
          onEmptySlotClick={onEmptySlotClick}
        />
      ) : view === "week" ? (
        <WeekGrid
          entries={entries}
          anchorDate={anchor}
          onEntryClick={onEntryClick}
          onEmptySlotClick={onEmptySlotClick}
        />
      ) : (
        <MonthGrid
          entries={entries}
          anchorDate={anchor}
          onEntryClick={onEntryClick}
          onDayClick={(date) => {
            setAnchor(date);
            setView("day");
          }}
        />
      )}
    </Wrap>
  );
}

function formatRange(view: CalendarView, anchor: Date): string {
  if (view === "day") {
    return anchor.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  if (view === "week") {
    const start = new Date(anchor);
    const day = start.getDay();
    const diff = (day + 6) % 7;
    start.setDate(start.getDate() - diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
  }
  return anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
