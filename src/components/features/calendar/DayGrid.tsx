"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
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

const DayHeader = styled.div`
  margin-bottom: ${SPACING.TWO};
  padding: 0 ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const DateLabel = styled.span`
  margin-left: ${SPACING.TWO};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 5rem 1fr;
`;

const TimeColumn = styled.div`
  position: relative;
  height: ${SLOTS * SLOT_PX}px;
  border-top: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
`;

const TimeLabel = styled.div`
  position: absolute;
  right: ${SPACING.TWO};
  transform: translateY(-50%);
  font-size: 0.625rem;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Column = styled.div<{ $clickable: boolean }>`
  position: relative;
  height: ${SLOTS * SLOT_PX}px;
  border-top: 1px solid ${COLORS.BORDER};
  border-left: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  cursor: ${(p) => (p.$clickable ? "cell" : "default")};
`;

const HourLine = styled.div`
  pointer-events: none;
  position: absolute;
  inset-inline: 0;
  border-top: 1px dashed rgba(226, 232, 240, 0.6);
`;

const Empty = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Tile = styled.div`
  position: absolute;
  left: ${SPACING.ONE};
  right: ${SPACING.ONE};

  & > button {
    height: 100%;
    width: 100%;
  }
`;

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
      <DayHeader>
        {DAY_LABEL[day]}
        <DateLabel>
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </DateLabel>
      </DayHeader>
      <Grid>
        <TimeColumn>
          {Array.from({ length: HOURS + 1 }).map((_, i) => (
            <TimeLabel key={i} style={{ top: i * (SLOT_PX * (60 / SLOT_MINUTES)) }}>
              {minutesToTime((START_HOUR + i) * 60)}
            </TimeLabel>
          ))}
        </TimeColumn>
        <Column
          $clickable={!!onEmptySlotClick}
          onClick={onColumnClick}
          role={onEmptySlotClick ? "button" : undefined}
        >
          {Array.from({ length: HOURS }).map((_, i) => (
            <HourLine key={i} aria-hidden style={{ top: (i + 1) * (SLOT_PX * (60 / SLOT_MINUTES)) }} />
          ))}
          {list.length === 0 ? <Empty>No classes scheduled for this day.</Empty> : null}
          {list.map((entry) => {
            const { top, height } = tileGeometry(entry.startMinutes, entry.endMinutes);
            return (
              <Tile key={entry.id} style={{ top, height }}>
                <ClassTile entry={entry} onClick={onEntryClick} />
              </Tile>
            );
          })}
        </Column>
      </Grid>
    </div>
  );
}
