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
import { TimeGridLayout } from "./TimeGridLayout";
import { TIME_GUTTER_WIDTH, isToday, tileGeometry } from "./timeGrid";

export interface WeekGridProps {
  entries: CalendarEntry[];
  anchorDate: Date;
  tileColorMode?: CalendarTileColorMode;
  occurrenceLookup?: CalendarOccurrenceLookup;
  onEntryClick?: CalendarEntryClickHandler;
  onEmptySlotClick?: (info: { dayOfWeek: DayOfWeek; minutes: number; date: Date }) => void;
}

const DesktopOnly = styled.div`
  display: none;

  ${LAYOUT.MEDIA.MD} {
    display: block;
  }
`;

const MobileOnly = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};

  ${LAYOUT.MEDIA.MD} {
    display: none;
  }
`;

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: ${TIME_GUTTER_WIDTH} repeat(7, minmax(0, 1fr));
`;

const HeaderSpacer = styled.div``;

const HeaderCell = styled.div<{ $isToday: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.HALF};
  padding: ${SPACING.TWO} ${SPACING.ONE};
  text-align: center;
  border-right: 1px solid ${COLORS.BORDER};

  ${(p) =>
    p.$isToday &&
    css`
      background-color: ${COLORS.CALENDAR_TODAY_COLUMN_BG};
      box-shadow: inset 0 3px 0 0 ${COLORS.CALENDAR_NOW_LINE};
    `}
`;

const HeaderDayNum = styled.span<{ $isToday: boolean }>`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.BOLD};
  font-variant-numeric: tabular-nums;
  color: ${(p) => (p.$isToday ? COLORS.ACTION_PRIMARY : COLORS.HEADER)};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
`;

const HeaderDayLabel = styled.span`
  font-size: ${FONTS.SIZE.MICRO};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const Tile = styled.div`
  position: absolute;
  left: ${SPACING.ONE};
  right: ${SPACING.ONE};
  z-index: 1;

  & > button {
    height: 100%;
    width: 100%;
  }
`;

const Section = styled.section`
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${LAYOUT.RADIUS.LG};
  background-color: ${COLORS.FOREGROUND};
  overflow: hidden;
`;

const SectionHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${COLORS.BORDER};
  padding: ${SPACING.TWO} ${SPACING.THREE};
`;

const SectionTitle = styled.h3`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const SectionDate = styled.span`
  margin-left: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const SectionEmpty = styled.p`
  padding: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const SectionList = styled.ul`
  display: flex;
  flex-direction: column;

  & > li {
    padding: ${SPACING.TWO};
  }

  & > li + li {
    border-top: 1px solid ${COLORS.BORDER};
  }
`;

export function WeekGrid({
  entries,
  anchorDate,
  tileColorMode = "capacity",
  occurrenceLookup,
  onEntryClick,
  onEmptySlotClick,
}: WeekGridProps) {
  const weekStart = startOfISOWeek(anchorDate);

  const dateByDay = React.useMemo(() => {
    const map = {} as Record<DayOfWeek, Date>;
    DAY_ORDER.forEach((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      map[day] = date;
    });
    return map;
  }, [weekStart]);

  const columns = DAY_ORDER.map((day) => ({
    id: day,
    date: dateByDay[day],
    dayOfWeek: day,
  }));

  const entriesByDay = React.useMemo(() => {
    const map = new Map<DayOfWeek, CalendarEntry[]>();
    for (const day of DAY_ORDER) {
      map.set(
        day,
        calendarEntriesForDate(entries, dateByDay[day]).sort(
          (a, b) => a.startMinutes - b.startMinutes,
        ),
      );
    }
    return map;
  }, [entries, dateByDay]);

  return (
    <div>
      <DesktopOnly>
        <TimeGridLayout
          columns={columns}
          onEmptySlotClick={onEmptySlotClick}
          header={
            <WeekHeader>
              <HeaderSpacer aria-hidden />
              {DAY_ORDER.map((day) => {
                const date = dateByDay[day];
                const today = isToday(date);
                return (
                  <HeaderCell key={day} $isToday={today}>
                    <HeaderDayNum $isToday={today}>
                      {String(date.getDate()).padStart(2, "0")}
                    </HeaderDayNum>
                    <HeaderDayLabel>{DAY_LABEL[day].slice(0, 3)}</HeaderDayLabel>
                  </HeaderCell>
                );
              })}
            </WeekHeader>
          }
          renderColumn={(column) => {
            const dayEntries = entriesByDay.get(column.dayOfWeek) ?? [];
            const columnDate = column.date;
            return dayEntries.map((entry) => {
              const { top, height } = tileGeometry(entry.startMinutes, entry.endMinutes);
              return (
                <Tile key={entry.id} style={{ top, height }}>
                  <ClassTile
                    entry={entry}
                    onClick={onEntryClick}
                    clickDate={columnDate}
                    sessionMarker={occurrenceLookup?.getMarker(entry, columnDate) ?? null}
                    colorMode={tileColorMode}
                  />
                </Tile>
              );
            });
          }}
        />
      </DesktopOnly>

      <MobileOnly>
        {DAY_ORDER.map((day) => {
          const list = entriesByDay.get(day) ?? [];
          const date = dateByDay[day];
          return (
            <Section key={day}>
              <SectionHeader>
                <SectionTitle>
                  {DAY_LABEL[day]}
                  <SectionDate>{date.getDate()}</SectionDate>
                </SectionTitle>
              </SectionHeader>
              {list.length === 0 ? (
                <SectionEmpty>No classes.</SectionEmpty>
              ) : (
                <SectionList>
                  {list.map((entry) => (
                    <li key={entry.id}>
                      <ClassTile
                        entry={entry}
                        onClick={onEntryClick}
                        clickDate={date}
                        sessionMarker={occurrenceLookup?.getMarker(entry, date) ?? null}
                        variant="month-bar"
                        colorMode={tileColorMode}
                      />
                    </li>
                  ))}
                </SectionList>
              )}
            </Section>
          );
        })}
      </MobileOnly>
    </div>
  );
}

export function startOfISOWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
