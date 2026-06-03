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
import type { CalendarEntry, CalendarEntryClickHandler, CalendarOccurrenceLookup, CalendarTileColorMode } from "./types";
import { isToday } from "./timeGrid";
import { startOfISOWeek } from "./WeekGrid";

export interface MonthGridProps {
  entries: CalendarEntry[];
  anchorDate: Date;
  tileColorMode?: CalendarTileColorMode;
  occurrenceLookup?: CalendarOccurrenceLookup;
  onEntryClick?: CalendarEntryClickHandler;
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
  padding: ${SPACING.TWO} ${SPACING.THREE};
  text-align: left;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
`;

const DayCell = styled.button<{ $inMonth: boolean; $isToday: boolean; $clickable: boolean }>`
  position: relative;
  display: flex;
  min-height: calc(${SPACING.TEN} * 2.2);
  flex-direction: column;
  gap: ${SPACING.ONE};
  border-bottom: 1px solid ${COLORS.BORDER};
  border-right: 1px solid ${COLORS.BORDER};
  padding: ${SPACING.TWO};
  text-align: left;
  background-color: ${(p) =>
    p.$inMonth ? COLORS.FOREGROUND : COLORS.CALENDAR_OUT_OF_MONTH_BG};
  transition: background-color 0.15s ease;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};

  ${(p) =>
    p.$isToday &&
    css`
      background-color: ${COLORS.CALENDAR_TODAY_COLUMN_BG};
      box-shadow: inset 0 0 0 1px ${COLORS.CALENDAR_TODAY_COLUMN_BORDER};
    `}

  ${(p) =>
    p.$clickable &&
    css`
      &:hover {
        background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
      }
    `}

  &:disabled {
    cursor: default;
  }
`;

const DateNumber = styled.span<{ $inMonth: boolean; $isToday: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: calc(${SPACING.FOUR} + ${SPACING.HALF});
  height: calc(${SPACING.FOUR} + ${SPACING.HALF});
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  font-variant-numeric: tabular-nums;
  color: ${(p) =>
    p.$isToday ? COLORS.WHITE : p.$inMonth ? COLORS.HEADER : COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};

  ${(p) =>
    p.$isToday &&
    css`
      border-radius: ${LAYOUT.RADIUS.FULL};
      background-color: ${COLORS.ACTION_PRIMARY};
    `}
`;

const Tiles = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
`;

const More = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${FONTS.SIZE.MICRO};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

export function MonthGrid({
  entries,
  anchorDate,
  tileColorMode = "capacity",
  occurrenceLookup,
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

  return (
    <Wrap>
      <HeaderRow>
        {DAY_ORDER.map((d) => (
          <HeaderCell key={d}>{DAY_LABEL[d]}</HeaderCell>
        ))}
      </HeaderRow>
      <Body>
        {cells.map((date) => {
          const inMonth = date.getMonth() === anchorDate.getMonth();
          const today = isToday(date);
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
              $isToday={today}
              $clickable={!!onDayClick}
            >
              <DateNumber $inMonth={inMonth} $isToday={today}>
                {String(date.getDate()).padStart(2, "0")}
              </DateNumber>
              <Tiles>
                {visible.map((entry) => (
                  <ClassTile
                    key={`${entry.id}-${date.toISOString()}`}
                    entry={entry}
                    onClick={onEntryClick}
                    clickDate={date}
                    sessionMarker={occurrenceLookup?.getMarker(entry, date) ?? null}
                    variant="month-bar"
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
