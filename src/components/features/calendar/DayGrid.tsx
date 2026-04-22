"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import { DAY_LABEL, minutesToTime } from "@/lib/time";
import { ClassTile } from "./ClassTile";
import type { CalendarEntry } from "./types";
import { HOURS, SLOTS, SLOT_MINUTES, SLOT_PX, START_HOUR, clamp, tileGeometry } from "./timeGrid";

const WEEKDAY_TO_ENUM: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export interface DayGridProps {
  entries: CalendarEntry[];
  date: Date;
  onEntryClick?: (entry: CalendarEntry) => void;
  onEmptySlotClick?: (info: { dayOfWeek: DayOfWeek; minutes: number; date: Date }) => void;
}

export function DayGrid({ entries, date, onEntryClick, onEmptySlotClick }: DayGridProps) {
  const day = WEEKDAY_TO_ENUM[date.getDay()]!;
  const list = React.useMemo(
    () =>
      entries
        .filter((e) => e.dayOfWeek === day)
        .slice()
        .sort((a, b) => a.startMinutes - b.startMinutes),
    [entries, day],
  );

  function onColumnClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onEmptySlotClick) return;
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const slotIndex = clamp(Math.floor(offsetY / SLOT_PX), 0, SLOTS - 1);
    onEmptySlotClick({
      dayOfWeek: day,
      minutes: START_HOUR * 60 + slotIndex * SLOT_MINUTES,
      date,
    });
  }

  return (
    <div>
      <div className="mb-2 px-1 text-sm font-semibold text-header">
        {DAY_LABEL[day]}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "5rem 1fr" }}>
        <div
          className="relative border-t border-border bg-foreground"
          style={{ height: SLOTS * SLOT_PX }}
        >
          {Array.from({ length: HOURS + 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute right-2 -translate-y-1/2 text-[10px] text-muted-foreground"
              style={{ top: i * (SLOT_PX * (60 / SLOT_MINUTES)) }}
            >
              {minutesToTime((START_HOUR + i) * 60)}
            </div>
          ))}
        </div>
        <div
          className={`relative border-t border-l border-border bg-foreground ${onEmptySlotClick ? "cursor-cell" : ""}`}
          style={{ height: SLOTS * SLOT_PX }}
          onClick={onColumnClick}
          role={onEmptySlotClick ? "button" : undefined}
        >
          {Array.from({ length: HOURS }).map((_, i) => (
            <div
              key={i}
              aria-hidden
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/60"
              style={{ top: (i + 1) * (SLOT_PX * (60 / SLOT_MINUTES)) }}
            />
          ))}
          {list.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No classes scheduled for this day.
            </div>
          ) : null}
          {list.map((entry) => {
            const { top, height } = tileGeometry(entry.startMinutes, entry.endMinutes);
            return (
              <div
                key={entry.id}
                className="absolute left-1 right-1"
                style={{ top, height }}
              >
                <ClassTile entry={entry} onClick={onEntryClick} className="h-full w-full" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
