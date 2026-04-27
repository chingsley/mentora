"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 5rem repeat(7, minmax(0, 1fr));
`;

const TopLeftCell = styled.div`
  position: sticky;
  left: 0;
  z-index: 10;
  background-color: ${COLORS.FOREGROUND};
`;

const HeaderCell = styled.div`
  border-bottom: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.TWO};
  text-align: center;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const HeaderDate = styled.span`
  display: block;
  font-size: 0.625rem;
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.MUTED_FOREGROUND};
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

const Tile = styled.div`
  position: absolute;
  left: ${SPACING.ONE};
  right: ${SPACING.ONE};

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

export function WeekGrid({ entries, anchorDate, onEntryClick, onEmptySlotClick }: WeekGridProps) {
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
      <DesktopOnly>
        <Grid>
          <TopLeftCell aria-hidden />
          {DAY_ORDER.map((d) => (
            <HeaderCell key={d}>
              <span>{DAY_LABEL[d].slice(0, 3)}</span>
              <HeaderDate>{dateByDay[d].getDate()}</HeaderDate>
            </HeaderCell>
          ))}

          <TimeColumn>
            {Array.from({ length: HOURS + 1 }).map((_, i) => (
              <TimeLabel key={i} style={{ top: i * (SLOT_PX * (60 / SLOT_MINUTES)) }}>
                {minutesToTime((START_HOUR + i) * 60)}
              </TimeLabel>
            ))}
          </TimeColumn>

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
        </Grid>
      </DesktopOnly>

      <MobileOnly>
        {DAY_ORDER.map((d) => {
          const list = byDay.get(d) ?? [];
          return (
            <Section key={d}>
              <SectionHeader>
                <SectionTitle>
                  {DAY_LABEL[d]}
                  <SectionDate>{dateByDay[d].getDate()}</SectionDate>
                </SectionTitle>
              </SectionHeader>
              {list.length === 0 ? (
                <SectionEmpty>No classes.</SectionEmpty>
              ) : (
                <SectionList>
                  {list.map((entry) => (
                    <li key={entry.id}>
                      <ClassTile entry={entry} onClick={onEntryClick} variant="pill" />
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
    <Column
      $clickable={!!onEmptySlotClick}
      onClick={onColumnClick}
      role={onEmptySlotClick ? "button" : undefined}
      aria-label={onEmptySlotClick ? `Add period on ${day}` : undefined}
    >
      {Array.from({ length: HOURS }).map((_, i) => (
        <HourLine key={i} aria-hidden style={{ top: (i + 1) * (SLOT_PX * (60 / SLOT_MINUTES)) }} />
      ))}
      {entries.map((entry) => {
        const { top, height } = tileGeometry(entry.startMinutes, entry.endMinutes);
        return (
          <Tile key={entry.id} style={{ top, height }}>
            <ClassTile entry={entry} onClick={onEntryClick} />
          </Tile>
        );
      })}
    </Column>
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
