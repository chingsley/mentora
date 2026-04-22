"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => shift(-1)}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => shift(1)}
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
          <h2 className="ml-2 text-sm font-semibold text-header sm:text-base">{title}</h2>
        </div>
        <div
          role="tablist"
          aria-label="Calendar view"
          className="inline-flex rounded-md border border-border bg-foreground p-0.5"
        >
          {VIEWS.map((v) => {
            const active = v.id === view;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setView(v.id)}
                className={`h-8 rounded-sm px-3 text-xs font-medium transition-colors ${
                  active ? "bg-header text-white" : "text-header hover:bg-header/[0.06]"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

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
    </div>
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
    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
  }
  return anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
