"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { DAY_LABEL, DAY_ORDER, minutesToTime } from "@/lib/time";
import { OfferingDialog, type OfferingDialogSubject, type OfferingDialogValue } from "./OfferingDialog";

const START_HOUR = 6;
const END_HOUR = 22;
const SLOT_MINUTES = 30;
const HOURS = END_HOUR - START_HOUR;
const SLOTS = (HOURS * 60) / SLOT_MINUTES;
const SLOT_PX = 24;

export interface ScheduleOffering {
  id: string;
  title: string;
  description?: string | null;
  subjectId: string;
  subjectName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  teacherCap: number;
  enrolled: number;
}

export interface WeeklyScheduleCalendarProps {
  offerings: ScheduleOffering[];
  subjects: OfferingDialogSubject[];
  globalCap: number;
  readOnly?: boolean;
}

interface SubjectTheme {
  bg: string;
  border: string;
  text: string;
}

const SUBJECT_PALETTE: SubjectTheme[] = [
  { bg: "#e0e7ff", border: "#a5b4fc", text: "#312e81" },
  { bg: "#d1fae5", border: "#6ee7b7", text: "#064e3b" },
  { bg: "#fef3c7", border: "#fcd34d", text: "#78350f" },
  { bg: "#e0f2fe", border: "#7dd3fc", text: "#0c4a6e" },
  { bg: "#ffe4e6", border: "#fda4af", text: "#881337" },
  { bg: "#ede9fe", border: "#c4b5fd", text: "#4c1d95" },
  { bg: "#ccfbf1", border: "#5eead4", text: "#134e4a" },
  { bg: "#ffedd5", border: "#fdba74", text: "#7c2d12" },
];

function subjectColor(subjectId: string): SubjectTheme {
  let hash = 0;
  for (let i = 0; i < subjectId.length; i += 1) {
    hash = (hash * 31 + subjectId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % SUBJECT_PALETTE.length;
  return SUBJECT_PALETTE[idx]!;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const DesktopOnly = styled.div`
  display: none;

  ${LAYOUT.MEDIA.MD} {
    display: block;
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

const Tile = styled.button<{ $bg: string; $border: string; $text: string; $clickable: boolean }>`
  position: absolute;
  left: ${SPACING.ONE};
  right: ${SPACING.ONE};
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${(p) => p.$border};
  background-color: ${(p) => p.$bg};
  color: ${(p) => p.$text};
  padding: ${SPACING.ONE} ${SPACING.TWO};
  text-align: left;
  font-size: 0.6875rem;
  line-height: 1.25;
  box-shadow: ${LAYOUT.SHADOW.SM};
  transition: box-shadow 0.15s ease;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};

  ${(p) =>
    p.$clickable &&
    css`
      &:hover {
        box-shadow: ${LAYOUT.SHADOW.MD};
      }
    `}
`;

const TileTitle = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
`;

const TileSub = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.8;
`;

const MobileOnly = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.MD} {
    display: none;
  }
`;

const Section = styled.section`
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
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

const Empty = styled.p`
  padding: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ItemList = styled.ul`
  display: flex;
  flex-direction: column;

  & > li + li {
    border-top: 1px solid ${COLORS.BORDER};
  }
`;

const ItemButton = styled.button<{ $clickable: boolean }>`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  text-align: left;
  background-color: transparent;
  cursor: ${(p) => (p.$clickable ? "pointer" : "default")};
  transition: background-color 0.15s ease;

  ${(p) =>
    p.$clickable &&
    css`
      &:hover {
        background-color: rgba(23, 32, 51, 0.03);
      }
    `}
`;

const ItemBody = styled.div`
  min-width: 0;
`;

const ItemTitle = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const ItemMeta = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Badge = styled.span`
  flex-shrink: 0;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.HEADER};
`;

export function WeeklyScheduleCalendar({
  offerings,
  subjects,
  globalCap,
  readOnly = false,
}: WeeklyScheduleCalendarProps) {
  const [dialog, setDialog] = React.useState<OfferingDialogValue | null>(null);

  function openCreate(day: DayOfWeek, minutesFromStart: number) {
    if (readOnly) return;
    const startMinutes = START_HOUR * 60 + minutesFromStart;
    const endMinutes = Math.min(24 * 60, startMinutes + 60);
    setDialog({ dayOfWeek: day, startMinutes, endMinutes });
  }

  function openEdit(o: ScheduleOffering) {
    if (readOnly) return;
    setDialog({
      id: o.id,
      title: o.title,
      description: o.description ?? "",
      subjectId: o.subjectId,
      dayOfWeek: o.dayOfWeek,
      startMinutes: o.startMinutes,
      endMinutes: o.endMinutes,
      teacherCap: o.teacherCap,
    });
  }

  const byDay = React.useMemo(() => {
    const map = new Map<DayOfWeek, ScheduleOffering[]>();
    for (const d of DAY_ORDER) map.set(d, []);
    for (const o of offerings) map.get(o.dayOfWeek)!.push(o);
    for (const arr of map.values()) arr.sort((a, b) => a.startMinutes - b.startMinutes);
    return map;
  }, [offerings]);

  return (
    <div>
      <DesktopOnly>
        <Grid>
          <TopLeftCell aria-hidden />
          {DAY_ORDER.map((d) => (
            <HeaderCell key={d}>{DAY_LABEL[d].slice(0, 3)}</HeaderCell>
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
              offerings={byDay.get(d) ?? []}
              onCreate={openCreate}
              onEdit={openEdit}
              readOnly={readOnly}
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
                <SectionTitle>{DAY_LABEL[d]}</SectionTitle>
                {!readOnly ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openCreate(d, (9 - START_HOUR) * 60)}
                  >
                    + Add
                  </Button>
                ) : null}
              </SectionHeader>
              {list.length === 0 ? (
                <Empty>No periods.</Empty>
              ) : (
                <ItemList>
                  {list.map((o) => (
                    <li key={o.id}>
                      <ItemButton
                        type="button"
                        onClick={() => openEdit(o)}
                        disabled={readOnly}
                        $clickable={!readOnly}
                      >
                        <ItemBody>
                          <ItemTitle>{o.title}</ItemTitle>
                          <ItemMeta>
                            {o.subjectName} &middot; {minutesToTime(o.startMinutes)}–
                            {minutesToTime(o.endMinutes)}
                          </ItemMeta>
                        </ItemBody>
                        <Badge>
                          {o.enrolled}/{o.teacherCap}
                        </Badge>
                      </ItemButton>
                    </li>
                  ))}
                </ItemList>
              )}
            </Section>
          );
        })}
      </MobileOnly>

      <OfferingDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        subjects={subjects}
        globalCap={globalCap}
        initial={dialog}
      />
    </div>
  );
}

function DayColumn({
  day,
  offerings,
  onCreate,
  onEdit,
  readOnly,
}: {
  day: DayOfWeek;
  offerings: ScheduleOffering[];
  onCreate: (day: DayOfWeek, minutesFromStart: number) => void;
  onEdit: (o: ScheduleOffering) => void;
  readOnly: boolean;
}) {
  function onColumnClick(e: React.MouseEvent<HTMLDivElement>) {
    if (readOnly) return;
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const slotIndex = clamp(Math.floor(offsetY / SLOT_PX), 0, SLOTS - 1);
    onCreate(day, slotIndex * SLOT_MINUTES);
  }

  return (
    <Column
      $clickable={!readOnly}
      onClick={onColumnClick}
      role={readOnly ? undefined : "button"}
      aria-label={readOnly ? undefined : `Add period on ${DAY_LABEL[day]}`}
    >
      {Array.from({ length: HOURS }).map((_, i) => (
        <HourLine key={i} aria-hidden style={{ top: (i + 1) * (SLOT_PX * (60 / SLOT_MINUTES)) }} />
      ))}
      {offerings.map((o) => {
        const startSlot = Math.max(0, (o.startMinutes - START_HOUR * 60) / SLOT_MINUTES);
        const endSlot = Math.min(SLOTS, (o.endMinutes - START_HOUR * 60) / SLOT_MINUTES);
        const top = startSlot * SLOT_PX;
        const height = Math.max(SLOT_PX, (endSlot - startSlot) * SLOT_PX - 2);
        const theme = subjectColor(o.subjectId);
        return (
          <Tile
            key={o.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(o);
            }}
            disabled={readOnly}
            $bg={theme.bg}
            $border={theme.border}
            $text={theme.text}
            $clickable={!readOnly}
            style={{ top, height }}
          >
            <TileTitle>{o.title}</TileTitle>
            <TileSub>
              {minutesToTime(o.startMinutes)}–{minutesToTime(o.endMinutes)}
            </TileSub>
            <TileSub>
              {o.enrolled}/{o.teacherCap}
            </TileSub>
          </Tile>
        );
      })}
    </Column>
  );
}
