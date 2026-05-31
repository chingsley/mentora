"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  GRID_HEIGHT_PX,
  HOUR_PX,
  HOURS,
  SLOT_PX,
  START_HOUR,
  TIME_GUTTER_WIDTH,
  VIEWPORT_HEIGHT_PX,
  clamp,
  currentTimeGridPx,
  isToday,
} from "./timeGrid";

export interface TimeGridColumn {
  id: string;
  date: Date;
  dayOfWeek: DayOfWeek;
}

export interface TimeGridLayoutProps {
  columns: TimeGridColumn[];
  header?: React.ReactNode;
  renderColumn: (column: TimeGridColumn) => React.ReactNode;
  onEmptySlotClick?: (info: { dayOfWeek: DayOfWeek; minutes: number; date: Date }) => void;
}

const Frame = styled.div`
  overflow: hidden;
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${LAYOUT.RADIUS.LG};
  background-color: ${COLORS.FOREGROUND};
`;

const HeaderSlot = styled.div`
  border-bottom: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
`;

const ScrollViewport = styled.div`
  max-height: ${VIEWPORT_HEIGHT_PX}px;
  overflow: auto;
  overscroll-behavior: contain;
`;

const ScrollInner = styled.div`
  position: relative;
`;

const BodyGrid = styled.div<{ $columnCount: number }>`
  display: grid;
  grid-template-columns: ${TIME_GUTTER_WIDTH} repeat(${(p) => p.$columnCount}, minmax(0, 1fr));
  min-height: ${GRID_HEIGHT_PX}px;
`;

const TimeGutter = styled.div`
  position: relative;
  height: ${GRID_HEIGHT_PX}px;
  border-right: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
`;

const TimeLabel = styled.span`
  position: absolute;
  right: ${SPACING.TWO};
  transform: translateY(-50%);
  font-size: ${FONTS.SIZE.XS};
  font-variant-numeric: tabular-nums;
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const DayColumn = styled.div<{ $clickable: boolean; $isToday: boolean }>`
  position: relative;
  height: ${GRID_HEIGHT_PX}px;
  border-right: 1px solid ${COLORS.BORDER};
  background-color: ${(p) => (p.$isToday ? COLORS.CALENDAR_TODAY_COLUMN_BG : COLORS.FOREGROUND)};
  cursor: ${(p) => (p.$clickable ? "cell" : "default")};

  ${(p) =>
    p.$isToday &&
    css`
      box-shadow: inset 0 3px 0 0 ${COLORS.CALENDAR_NOW_LINE};
    `}
`;

const HourLine = styled.div`
  pointer-events: none;
  position: absolute;
  inset-inline: 0;
  border-top: 1px solid ${COLORS.CALENDAR_GRID_HOUR_LINE};
`;

const HalfHourLine = styled.div`
  pointer-events: none;
  position: absolute;
  inset-inline: 0;
  border-top: 1px dashed ${COLORS.CALENDAR_GRID_HALF_HOUR_LINE};
`;

const GridLinesLayer = styled.div`
  pointer-events: none;
  position: absolute;
  inset: 0;
`;

const NowMarker = styled.div<{ $top: number }>`
  pointer-events: none;
  position: absolute;
  top: ${(p) => p.$top}px;
  left: 0;
  right: 0;
  z-index: 3;
  display: grid;
  grid-template-columns: ${TIME_GUTTER_WIDTH} repeat(var(--column-count), minmax(0, 1fr));
  align-items: center;
`;

const NowDot = styled.span`
  justify-self: end;
  width: ${SPACING.TWO};
  height: ${SPACING.TWO};
  margin-right: calc(${SPACING.ONE} * -1);
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.CALENDAR_NOW_LINE};
`;

const NowSegment = styled.span<{ $variant: "past" | "future" }>`
  height: 0;
  border-top: 2px ${(p) => (p.$variant === "past" ? "dashed" : "solid")} ${COLORS.CALENDAR_NOW_LINE};
  opacity: ${(p) => (p.$variant === "past" ? 0.45 : 1)};
`;

function useScrollToNow(active: boolean) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    const nowPx = currentTimeGridPx();
    if (!el || nowPx == null) return;
    el.scrollTop = Math.max(0, nowPx - HOUR_PX);
  });

  return scrollRef;
}

function GridLines() {
  return (
    <GridLinesLayer aria-hidden>
      {Array.from({ length: HOURS }).map((_, hourIndex) => (
        <HourLine key={`hour-${hourIndex}`} style={{ top: hourIndex * HOUR_PX }} />
      ))}
      {Array.from({ length: HOURS }).map((_, hourIndex) => (
        <HalfHourLine key={`half-${hourIndex}`} style={{ top: hourIndex * HOUR_PX + HOUR_PX / 2 }} />
      ))}
    </GridLinesLayer>
  );
}

export function TimeGridLayout({
  columns,
  header,
  renderColumn,
  onEmptySlotClick,
}: TimeGridLayoutProps) {
  const todayColumnIndex = columns.findIndex((column) => isToday(column.date));
  const showNow = todayColumnIndex >= 0;
  const nowPx = showNow ? currentTimeGridPx() : null;
  const scrollRef = useScrollToNow(showNow);

  function handleColumnClick(
    column: TimeGridColumn,
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    if (!onEmptySlotClick) return;
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const slotIndex = clamp(Math.floor(offsetY / SLOT_PX), 0, HOURS * 2 - 1);
    onEmptySlotClick({
      dayOfWeek: column.dayOfWeek,
      minutes: START_HOUR * 60 + slotIndex * 30,
      date: column.date,
    });
  }

  return (
    <Frame>
      {header ? <HeaderSlot>{header}</HeaderSlot> : null}
      <ScrollViewport ref={scrollRef}>
        <ScrollInner
          style={{ ["--column-count" as string]: columns.length } as React.CSSProperties}
        >
          <BodyGrid $columnCount={columns.length}>
            <TimeGutter>
              {Array.from({ length: HOURS + 1 }).map((_, hourIndex) => (
                <TimeLabel key={hourIndex} style={{ top: hourIndex * HOUR_PX }}>
                  {String(START_HOUR + hourIndex).padStart(2, "0")}:00
                </TimeLabel>
              ))}
            </TimeGutter>

            {columns.map((column) => (
              <DayColumn
                key={column.id}
                $clickable={!!onEmptySlotClick}
                $isToday={isToday(column.date)}
                onClick={(event) => handleColumnClick(column, event)}
                role={onEmptySlotClick ? "button" : undefined}
                aria-label={onEmptySlotClick ? `Add period on ${column.dayOfWeek}` : undefined}
              >
                <GridLines />
                {renderColumn(column)}
              </DayColumn>
            ))}
          </BodyGrid>

          {nowPx != null ? (
            <NowMarker $top={nowPx} aria-hidden>
              <NowDot />
              {columns.map((column, index) => (
                <NowSegment
                  key={column.id}
                  $variant={index < todayColumnIndex ? "past" : "future"}
                />
              ))}
            </NowMarker>
          ) : null}
        </ScrollInner>
      </ScrollViewport>
    </Frame>
  );
}
