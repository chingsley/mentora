"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import { DAY_LABEL, DAY_ORDER } from "@/lib/time";
import { ClassTile } from "./ClassTile";
import type { CalendarEntry } from "./types";
import { startOfISOWeek } from "./WeekGrid";

const WEEKDAY_TO_ENUM: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export interface MonthGridProps {
  entries: CalendarEntry[];
  anchorDate: Date;
  onEntryClick?: (entry: CalendarEntry) => void;
  onDayClick?: (date: Date) => void;
}

export function MonthGrid({ entries, anchorDate, onEntryClick, onDayClick }: MonthGridProps) {
  const entriesByDay = React.useMemo(() => {
    const map = new Map<DayOfWeek, CalendarEntry[]>();
    for (const d of DAY_ORDER) map.set(d, []);
    for (const e of entries) map.get(e.dayOfWeek)!.push(e);
    for (const arr of map.values()) arr.sort((a, b) => a.startMinutes - b.startMinutes);
    return map;
  }, [entries]);

  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const gridStart = startOfISOWeek(monthStart);
  const cells = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-foreground">
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_ORDER.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-center text-xs font-semibold text-header"
          >
            {DAY_LABEL[d].slice(0, 3)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date) => {
          const dow = WEEKDAY_TO_ENUM[date.getDay()]!;
          const inMonth = date.getMonth() === anchorDate.getMonth();
          const isToday = date.getTime() === today.getTime();
          const dayEntries = entriesByDay.get(dow) ?? [];
          const visible = dayEntries.slice(0, 3);
          const more = dayEntries.length - visible.length;

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={onDayClick ? () => onDayClick(date) : undefined}
              disabled={!onDayClick}
              className={`relative flex min-h-[5.5rem] flex-col gap-1 border-b border-l border-border px-1.5 py-1 text-left transition-colors ${
                inMonth ? "bg-foreground" : "bg-background/50"
              } ${onDayClick ? "hover:bg-header/[0.03]" : ""}`}
            >
              <span
                className={`text-[11px] font-semibold ${
                  inMonth ? "text-header" : "text-muted-foreground"
                } ${isToday ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-header text-white" : ""}`}
              >
                {date.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {visible.map((entry) => (
                  <ClassTile
                    key={`${entry.id}-${date.toISOString()}`}
                    entry={entry}
                    onClick={onEntryClick}
                    variant="pill"
                  />
                ))}
                {more > 0 ? (
                  <span className="truncate text-[10px] text-muted-foreground">
                    +{more} more
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
