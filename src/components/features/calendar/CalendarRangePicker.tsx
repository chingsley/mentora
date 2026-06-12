"use client";

import * as React from "react";
import styled, { css } from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { DAY_ORDER } from "@/lib/time";
import { isToday } from "./timeGrid";
import type { CalendarView } from "./types";
import { startOfISOWeek } from "./WeekGrid";

export interface CalendarRangePickerProps {
  view: CalendarView;
  anchor: Date;
  onSelect: (date: Date) => void;
}

/** Seven day columns × 48px cells + horizontal padding — avoids cramped/overlapping dates. */
const DAY_PICKER_WIDTH = `calc(7 * ${SPACING.TWELVE} + ${SPACING.SIX} * 2)`;
const MONTH_PICKER_WIDTH = `calc(3 * ${SPACING.TWELVE} * 2 + ${SPACING.SIX} * 2)`;

const pickerChrome = css`
  position: absolute;
  top: calc(100% + ${SPACING.TWO});
  left: 0;
  z-index: ${LAYOUT.Z.STICKY};
  overflow: hidden;
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${LAYOUT.RADIUS.LG};
  background-color: ${COLORS.FOREGROUND};
  box-shadow: ${LAYOUT.SHADOW.LG};
  padding: ${SPACING.FOUR};
`;

const DayPickerWrap = styled.div`
  ${pickerChrome}
  width: ${DAY_PICKER_WIDTH};
  min-width: ${DAY_PICKER_WIDTH};
`;

const MonthPickerWrap = styled.div`
  ${pickerChrome}
  width: ${MONTH_PICKER_WIDTH};
  min-width: ${MONTH_PICKER_WIDTH};
`;

const PickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  margin-bottom: ${SPACING.FOUR};
`;

const PickerTitle = styled.h2`
  flex: 1;
  margin: 0;
  text-align: center;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  white-space: nowrap;
`;

const NavButton = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: ${SPACING.TWELVE};
  min-height: ${SPACING.TWELVE};
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

const CalendarGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: ${SPACING.ONE};
`;

const WeekdayHeader = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${SPACING.EIGHT};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  text-transform: capitalize;
`;

const DayButton = styled.button<{
  $inMonth: boolean;
  $selected: boolean;
  $inWeek: boolean;
  $today: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: ${SPACING.TWELVE};
  border: none;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${(p) => {
    if (p.$inWeek) return COLORS.ACTION_PRIMARY_TINT_10;
    if (p.$today && !p.$selected) return COLORS.CALENDAR_TODAY_COLUMN_BG;
    return COLORS.TRANSPARENT;
  }};
  cursor: pointer;
  transition: background-color 0.15s ease;

  ${(p) =>
    p.$inWeek &&
    css`
      box-shadow: inset 0 0 0 1px ${COLORS.ACTION_PRIMARY_BORDER_22};
    `}

  ${(p) =>
    !p.$selected &&
    css`
      &:hover {
        background-color: ${p.$inWeek ? COLORS.ACTION_PRIMARY_TINT_16 : COLORS.SURFACE_NEUTRAL_HOVER};
      }
    `}
`;

const DayLabel = styled.span<{ $inMonth: boolean; $selected: boolean; $today: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: ${SPACING.EIGHT};
  min-height: ${SPACING.EIGHT};
  border-radius: ${LAYOUT.RADIUS.FULL};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${(p) => (p.$selected || p.$today ? FONTS.WEIGHT.SEMIBOLD : FONTS.WEIGHT.NORMAL)};
  font-variant-numeric: tabular-nums;
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${(p) => {
    if (p.$selected) return COLORS.WHITE;
    if (!p.$inMonth) return COLORS.MUTED_FOREGROUND;
    return COLORS.HEADER;
  }};

  ${(p) =>
    p.$selected &&
    css`
      background-color: ${COLORS.ACTION_PRIMARY};
    `}

  ${(p) =>
    p.$today &&
    !p.$selected &&
    css`
      box-shadow: inset 0 0 0 1px ${COLORS.ACTION_PRIMARY};
    `}
`;

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${SPACING.TWO};
`;

const MonthButton = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${SPACING.TWELVE};
  width: 100%;
  border: 1px solid ${(p) => (p.$selected ? COLORS.ACTION_PRIMARY : COLORS.TRANSPARENT)};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${(p) => (p.$selected ? COLORS.ACTION_PRIMARY : COLORS.TRANSPARENT)};
  padding: ${SPACING.THREE} ${SPACING.FOUR};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${(p) => (p.$selected ? FONTS.WEIGHT.SEMIBOLD : FONTS.WEIGHT.MEDIUM)};
  color: ${(p) => (p.$selected ? COLORS.WHITE : COLORS.HEADER)};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background-color: ${(p) =>
      p.$selected ? COLORS.ACTION_PRIMARY_HOVER : COLORS.SURFACE_NEUTRAL_HOVER};
    border-color: ${(p) =>
      p.$selected ? COLORS.ACTION_PRIMARY_HOVER : COLORS.SURFACE_NEUTRAL_BORDER_HOVER};
  }
`;

const MONTH_LABELS = Array.from({ length: 12 }, (_, month) =>
  new Date(2000, month, 1).toLocaleDateString(undefined, { month: "short" }),
);

const WEEKDAY_SHORT = Object.fromEntries(
  DAY_ORDER.map((day, index) => {
    const date = new Date(2024, 0, 1 + index);
    return [day, date.toLocaleDateString(undefined, { weekday: "short" })];
  }),
) as Record<(typeof DAY_ORDER)[number], string>;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameWeek(a: Date, b: Date): boolean {
  return startOfISOWeek(a).getTime() === startOfISOWeek(b).getTime();
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function chunkWeeks(dates: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let index = 0; index < dates.length; index += 7) {
    weeks.push(dates.slice(index, index + 7));
  }
  return weeks;
}

function MiniMonthPicker({ view, anchor, onSelect, titleId }: CalendarRangePickerProps & { titleId: string }) {
  const [displayMonth, setDisplayMonth] = React.useState(
    () => new Date(anchor.getFullYear(), anchor.getMonth(), 1),
  );

  React.useEffect(() => {
    setDisplayMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  }, [anchor]);

  const gridStart = startOfISOWeek(displayMonth);
  const cells = React.useMemo(
    () =>
      Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        return date;
      }),
    [gridStart],
  );
  const weeks = React.useMemo(() => chunkWeeks(cells), [cells]);

  const title = displayMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(direction: -1 | 1) {
    setDisplayMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + direction, 1),
    );
  }

  return (
    <DayPickerWrap role="dialog" aria-labelledby={titleId}>
      <PickerHeader>
        <NavButton type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
          <ChevronLeft size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
        </NavButton>
        <PickerTitle id={titleId}>{title}</PickerTitle>
        <NavButton type="button" aria-label="Next month" onClick={() => shiftMonth(1)}>
          <ChevronRight size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
        </NavButton>
      </PickerHeader>

      <CalendarGrid role="grid" aria-labelledby={titleId}>
        <GridRow role="row">
          {DAY_ORDER.map((day) => (
            <WeekdayHeader key={day} role="columnheader" aria-label={day}>
              {WEEKDAY_SHORT[day]}
            </WeekdayHeader>
          ))}
        </GridRow>

        {weeks.map((week) => (
          <GridRow key={week[0]?.toISOString()} role="row">
            {week.map((date) => {
              const inMonth = date.getMonth() === displayMonth.getMonth();
              const inWeek = view === "week" && isSameWeek(date, anchor);
              const daySelected = view === "day" && isSameDay(date, anchor);
              const today = isToday(date);

              return (
                <DayButton
                  key={date.toISOString()}
                  type="button"
                  role="gridcell"
                  aria-selected={daySelected || inWeek}
                  aria-label={formatDayLabel(date)}
                  aria-current={today ? "date" : undefined}
                  $inMonth={inMonth}
                  $selected={daySelected}
                  $inWeek={inWeek}
                  $today={today}
                  onClick={() => onSelect(date)}
                >
                  <DayLabel $inMonth={inMonth} $selected={daySelected} $today={today}>
                    {date.getDate()}
                  </DayLabel>
                </DayButton>
              );
            })}
          </GridRow>
        ))}
      </CalendarGrid>
    </DayPickerWrap>
  );
}

function MonthYearPicker({
  anchor,
  onSelect,
  titleId,
}: Pick<CalendarRangePickerProps, "anchor" | "onSelect"> & { titleId: string }) {
  const [displayYear, setDisplayYear] = React.useState(() => anchor.getFullYear());

  React.useEffect(() => {
    setDisplayYear(anchor.getFullYear());
  }, [anchor]);

  return (
    <MonthPickerWrap role="dialog" aria-labelledby={titleId}>
      <PickerHeader>
        <NavButton type="button" aria-label="Previous year" onClick={() => setDisplayYear((y) => y - 1)}>
          <ChevronLeft size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
        </NavButton>
        <PickerTitle id={titleId}>{displayYear}</PickerTitle>
        <NavButton type="button" aria-label="Next year" onClick={() => setDisplayYear((y) => y + 1)}>
          <ChevronRight size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
        </NavButton>
      </PickerHeader>

      <MonthGrid role="listbox" aria-labelledby={titleId}>
        {MONTH_LABELS.map((label, month) => {
          const date = new Date(displayYear, month, 1);
          const selected = isSameMonth(date, anchor);

          return (
            <MonthButton
              key={month}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={`${label} ${displayYear}`}
              $selected={selected}
              onClick={() => onSelect(date)}
            >
              {label}
            </MonthButton>
          );
        })}
      </MonthGrid>
    </MonthPickerWrap>
  );
}

export function CalendarRangePicker({ view, anchor, onSelect }: CalendarRangePickerProps) {
  const titleId = React.useId();

  if (view === "month") {
    return <MonthYearPicker anchor={anchor} onSelect={onSelect} titleId={titleId} />;
  }

  return (
    <MiniMonthPicker view={view} anchor={anchor} onSelect={onSelect} titleId={titleId} />
  );
}
