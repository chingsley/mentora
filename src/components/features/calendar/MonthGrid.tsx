"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { DAY_LABEL, DAY_ORDER } from "@/lib/time";
import { calendarEntriesForDate } from "@/lib/offeringRecurrence";
import { ClassTile } from "./ClassTile";
import type { CalendarEntry, CalendarTileColorMode } from "./types";
import { startOfISOWeek } from "./WeekGrid";

export interface MonthGridProps {
  entries: CalendarEntry[];
  anchorDate: Date;
  tileColorMode?: CalendarTileColorMode;
  onEntryClick?: (entry: CalendarEntry) => void;
  onDayClick?: (date: Date) => void;
}

const Wrap = styled.div`
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-bottom: 1px solid ${COLORS.BORDER};
`;

const HeaderCell = styled.div`
  padding: ${SPACING.TWO};
  text-align: center;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
`;

const DayCell = styled.button<{ $inMonth: boolean; $clickable: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  min-height: 5.5rem;
  border-bottom: 1px solid ${COLORS.BORDER};
  border-left: 1px solid ${COLORS.BORDER};
  padding: ${SPACING.ONE} 0.375rem;
  text-align: left;
  background-color: ${(p) => (p.$inMonth ? COLORS.FOREGROUND : "rgba(245, 245, 247, 0.5)")};
  transition: background-color 0.15s ease;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};

  ${(p) =>
    p.$clickable &&
    css`
      &:hover {
        background-color: rgba(23, 32, 51, 0.03);
      }
    `}

  &:disabled {
    cursor: default;
  }
`;

const DateNumber = styled.span<{ $inMonth: boolean; $isToday: boolean }>`
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${(p) => (p.$inMonth ? COLORS.HEADER : COLORS.MUTED_FOREGROUND)};

  ${(p) =>
    p.$isToday &&
    css`
      display: inline-flex;
      height: 1.25rem;
      width: 1.25rem;
      align-items: center;
      justify-content: center;
      border-radius: ${LAYOUT.RADIUS.FULL};
      background-color: ${COLORS.HEADER};
      color: ${COLORS.WHITE};
    `}
`;

const Tiles = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

const More = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${FONTS.SIZE.MICRO};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export function MonthGrid({
  entries,
  anchorDate,
  tileColorMode = "capacity",
  onEntryClick,
  onDayClick,
}: MonthGridProps) {
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const gridStart = startOfISOWeek(monthStart);
  const cells = React.useMemo(
    () =>
      Array.from({ length: 42 }).map((_, i) => {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        return d;
      }),
    [gridStart],
  );

  const entriesByDay = React.useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const date of cells) {
      const key = date.toISOString();
      const dayEntries = calendarEntriesForDate(entries, date).sort(
        (a, b) => a.startMinutes - b.startMinutes,
      );
      map.set(key, dayEntries);
    }
    return map;
  }, [entries, cells]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Wrap>
      <HeaderRow>
        {DAY_ORDER.map((d) => (
          <HeaderCell key={d}>{DAY_LABEL[d].slice(0, 3)}</HeaderCell>
        ))}
      </HeaderRow>
      <Body>
        {cells.map((date) => {
          const inMonth = date.getMonth() === anchorDate.getMonth();
          const isToday = date.getTime() === today.getTime();
          const dayEntries = entriesByDay.get(date.toISOString()) ?? [];
          const visible = dayEntries.slice(0, 3);
          const more = dayEntries.length - visible.length;

          return (
            <DayCell
              key={date.toISOString()}
              type="button"
              onClick={onDayClick ? () => onDayClick(date) : undefined}
              disabled={!onDayClick}
              $inMonth={inMonth}
              $clickable={!!onDayClick}
            >
              <DateNumber $inMonth={inMonth} $isToday={isToday}>
                {date.getDate()}
              </DateNumber>
              <Tiles>
                {visible.map((entry) => (
                  <ClassTile
                    key={`${entry.id}-${date.toISOString()}`}
                    entry={entry}
                    onClick={onEntryClick}
                    variant="pill"
                    colorMode={tileColorMode}
                  />
                ))}
                {more > 0 ? <More>+{more} more</More> : null}
              </Tiles>
            </DayCell>
          );
        })}
      </Body>
    </Wrap>
  );
}
