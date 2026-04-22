"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import { DAY_LABEL, DAY_ORDER, minutesToTime } from "@/lib/time";
import { ClassTile } from "./ClassTile";
import type { CalendarEntry } from "./types";
import { HOURS, SLOTS, SLOT_MINUTES, SLOT_PX, START_HOUR, clamp, tileGeometry } from "./timeGrid";

export interface WeekGridProps {
  entries: CalendarEntry[];
  anchorDate: Date;
  onEntryClick?: (entry: CalendarEntry) => void;
  onEmptySlotClick?: (info: { dayOfWeek: DayOfWeek; minutes: number; date: Date }) => void;
}

export function WeekGrid({
  entries,
  anchorDate,
  onEntryClick,
  onEmptySlotClick,
}: WeekGridProps) {
  const byDay = React.useMemo(() => groupByDay(entries), [entries]);
  const weekStart = startOfISOWeek(anchorDate);

  const dateByDay: Record<DayOfWeek, Date> = {} as Record<DayOfWeek, Date>;
  DAY_ORDER.forEach((d, idx) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + idx);
    dateByDay[d] = date;
  });

  return (
    <div>
      <div className="hidden md:block">
        <div
          className="grid"
          style={{ gridTemplateColumns: "5rem repeat(7, minmax(0, 1fr))" }}
        >
          <div aria-hidden className="sticky left-0 z-10 bg-foreground" />
          {DAY_ORDER.map((d) => (
            <div
              key={d}
              className="border-b border-border bg-foreground px-2 py-2 text-center text-xs font-semibold text-header"
            >
              <span className="block">{DAY_LABEL[d].slice(0, 3)}</span>
              <span className="block text-[10px] font-normal text-muted-foreground">
                {dateByDay[d].getDate()}
              </span>
            </div>
          ))}

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

          {DAY_ORDER.map((d) => (
            <DayColumn
              key={d}
              day={d}
              date={dateByDay[d]}
              entries={byDay.get(d) ?? []}
              onEntryClick={onEntryClick}
              onEmptySlotClick={onEmptySlotClick}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {DAY_ORDER.map((d) => {
          const list = byDay.get(d) ?? [];
          return (
            <section key={d} className="rounded-lg border border-border bg-foreground">
              <header className="flex items-center justify-between border-b border-border px-3 py-2">
                <h3 className="text-sm font-semibold text-header">
                  {DAY_LABEL[d]} <span className="ml-1 text-xs text-muted-foreground">{dateByDay[d].getDate()}</span>
                </h3>
              </header>
              {list.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">No classes.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {list.map((entry) => (
                    <li key={entry.id} className="p-2">
                      <ClassTile entry={entry} onClick={onEntryClick} variant="pill" />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function DayColumn({
  day,
  date,
  entries,
  onEntryClick,
  onEmptySlotClick,
}: {
  day: DayOfWeek;
  date: Date;
  entries: CalendarEntry[];
  onEntryClick?: (entry: CalendarEntry) => void;
  onEmptySlotClick?: (info: { dayOfWeek: DayOfWeek; minutes: number; date: Date }) => void;
}) {
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
    <div
      className={`relative border-t border-l border-border bg-foreground ${onEmptySlotClick ? "cursor-cell" : ""}`}
      style={{ height: SLOTS * SLOT_PX }}
      onClick={onColumnClick}
      role={onEmptySlotClick ? "button" : undefined}
      aria-label={onEmptySlotClick ? `Add period on ${day}` : undefined}
    >
      {Array.from({ length: HOURS }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/60"
          style={{ top: (i + 1) * (SLOT_PX * (60 / SLOT_MINUTES)) }}
        />
      ))}
      {entries.map((entry) => {
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
  );
}

function groupByDay(entries: CalendarEntry[]): Map<DayOfWeek, CalendarEntry[]> {
  const map = new Map<DayOfWeek, CalendarEntry[]>();
  for (const d of DAY_ORDER) map.set(d, []);
  for (const e of entries) map.get(e.dayOfWeek)!.push(e);
  for (const arr of map.values()) arr.sort((a, b) => a.startMinutes - b.startMinutes);
  return map;
}

export function startOfISOWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
