"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import { DAY_LABEL } from "@/lib/time";
import { calendarEntriesForDate } from "@/lib/offeringRecurrence";
import { ClassTile } from "./ClassTile";
import type { CalendarEntry, CalendarEntryClickHandler, CalendarOccurrenceLookup, CalendarTileColorMode } from "./types";
import { TimeGridLayout } from "./TimeGridLayout";
import { tileGeometry } from "./timeGrid";

export interface DayGridProps {
  entries: CalendarEntry[];
  date: Date;
  tileColorMode?: CalendarTileColorMode;
  occurrenceLookup?: CalendarOccurrenceLookup;
  onEntryClick?: CalendarEntryClickHandler;
  onEmptySlotClick?: (info: { dayOfWeek: DayOfWeek; minutes: number; date: Date }) => void;
}

const WEEKDAY_TO_ENUM: DayOfWeek[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const DayHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: ${SPACING.THREE} ${SPACING.FOUR};
`;

const DayHeaderMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.HALF};
`;

const DayNumber = styled.span`
  font-size: ${FONTS.SIZE.PAGE_HEADER};
  font-weight: ${FONTS.WEIGHT.BOLD};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${COLORS.ACTION_PRIMARY};
`;

const DayName = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.ACTION_PRIMARY};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const Empty = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  text-align: center;
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

export function DayGrid({
  entries,
  date,
  tileColorMode = "capacity",
  occurrenceLookup,
  onEntryClick,
  onEmptySlotClick,
}: DayGridProps) {
  const day = WEEKDAY_TO_ENUM[date.getDay()]!;
  const list = React.useMemo(
    () => calendarEntriesForDate(entries, date).sort((a, b) => a.startMinutes - b.startMinutes),
    [entries, date],
  );

  const column = {
    id: date.toISOString(),
    date,
    dayOfWeek: day,
  };

  return (
    <TimeGridLayout
      columns={[column]}
      onEmptySlotClick={onEmptySlotClick}
      header={
        <DayHeader>
          <DayHeaderMain>
            <DayNumber>{String(date.getDate()).padStart(2, "0")}</DayNumber>
            <DayName>{DAY_LABEL[day]}</DayName>
          </DayHeaderMain>
        </DayHeader>
      }
      renderColumn={() => (
        <>
          {list.length === 0 ? <Empty>No classes scheduled for this day.</Empty> : null}
          {list.map((entry) => {
            const { top, height } = tileGeometry(entry.startMinutes, entry.endMinutes);
            return (
              <Tile key={entry.id} style={{ top, height }}>
                <ClassTile
                  entry={entry}
                  onClick={onEntryClick}
                  clickDate={date}
                  sessionMarker={occurrenceLookup?.getMarker(entry, date) ?? null}
                  colorMode={tileColorMode}
                />
              </Tile>
            );
          })}
        </>
      )}
    />
  );
}
