"use client";

import styled from "styled-components";
import { Repeat } from "lucide-react";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { COLORS } from "@/constants/colors.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { minutesToTime } from "@/lib/time";
import { subjectThemeForId } from "@/lib/subjectPalette";
import {
  BLOCKED_THEME,
  FILL_LABEL,
  FILL_THEME,
  fillStatus,
  type CalendarEntry,
  type CalendarTileColorMode,
  type FillStatus,
} from "./types";

export interface ClassTileProps {
  entry: CalendarEntry;
  onClick?: (entry: CalendarEntry) => void;
  variant?: "block" | "pill" | "month-bar";
  colorMode?: CalendarTileColorMode;
  className?: string;
}

const TileBase = styled.button<{
  $status: FillStatus;
  $blocked: boolean;
  $variant: "block" | "pill" | "month-bar";
  $interactive: boolean;
  $subjectBg?: string;
  $subjectBgHover?: string;
  $subjectBorder?: string;
  $subjectText?: string;
  $useSubjectTheme: boolean;
}>`
  display: ${(p) => (p.$variant === "block" ? "flex" : "inline-flex")};
  flex-direction: ${(p) => (p.$variant === "block" ? "column" : "row")};
  align-items: ${(p) => (p.$variant === "month-bar" ? "center" : p.$variant === "block" ? "stretch" : "center")};
  gap: ${(p) =>
    p.$variant === "block" ? SPACING.HALF : p.$variant === "month-bar" ? SPACING.TWO : "0.375rem"};
  width: 100%;
  overflow: hidden;
  text-align: left;
  border-radius: ${(p) => (p.$variant === "month-bar" ? LAYOUT.RADIUS.SM : LAYOUT.RADIUS.MD)};
  border: 1px solid
    ${(p) =>
      p.$blocked
        ? BLOCKED_THEME.border
        : p.$variant === "month-bar"
          ? COLORS.TRANSPARENT
          : p.$useSubjectTheme
            ? p.$subjectBorder
            : FILL_THEME[p.$status].border};
  padding: ${(p) =>
    p.$variant === "block"
      ? `${SPACING.ONE} ${SPACING.TWO}`
      : p.$variant === "month-bar"
        ? `${SPACING.ONE} ${SPACING.TWO}`
        : `0.125rem ${SPACING.THREE}`};
  font-size: ${(p) =>
    p.$variant === "block" ? FONTS.SIZE.META : p.$variant === "month-bar" ? FONTS.SIZE.MICRO : FONTS.SIZE.MICRO};
  line-height: ${FONTS.LINE_HEIGHT.SNUG};
  background-color: ${(p) =>
    p.$blocked
      ? BLOCKED_THEME.bg
      : p.$variant === "month-bar"
        ? COLORS.CALENDAR_EVENT_BG
        : p.$useSubjectTheme
          ? p.$subjectBg
          : FILL_THEME[p.$status].bg};
  color: ${(p) =>
    p.$blocked
      ? BLOCKED_THEME.text
      : p.$variant === "month-bar"
        ? COLORS.CALENDAR_EVENT_TEXT
        : p.$useSubjectTheme
          ? p.$subjectText
          : FILL_THEME[p.$status].text};
  cursor: ${(p) => (p.$interactive ? "pointer" : "default")};
  box-shadow: ${(p) => (p.$variant === "block" ? LAYOUT.SHADOW.SM : "none")};
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${(p) =>
      p.$blocked
        ? BLOCKED_THEME.bgHover
        : p.$variant === "month-bar"
          ? COLORS.CALENDAR_EVENT_BG_HOVER
          : p.$useSubjectTheme
            ? p.$subjectBgHover
            : FILL_THEME[p.$status].bgHover};
  }

  &:disabled {
    cursor: default;
  }
`;

const MonthBarAccent = styled.span`
  flex-shrink: 0;
  align-self: stretch;
  width: ${SPACING.HALF};
  border-radius: ${LAYOUT.RADIUS.SM};
  background-color: ${COLORS.CALENDAR_EVENT_ACCENT};
`;

const MonthBarText = styled.span`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
`;

const RecurrenceIconWrap = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  color: ${COLORS.CALENDAR_EVENT_ACCENT};
`;

const TitleSpan = styled.span`
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DimSpan = styled.span`
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function ClassTile({
  entry,
  onClick,
  variant = "block",
  colorMode = "capacity",
  className,
}: ClassTileProps) {
  const blocked = entry.visibility === "blocked";
  const status = fillStatus(entry);
  const interactive = !!onClick && !blocked;
  const useSubjectTheme = colorMode === "subject" && !blocked;
  const subjectTheme = useSubjectTheme ? subjectThemeForId(entry.subjectId) : null;
  const showsRecurrenceIcon = !entry.recurrence || entry.recurrence.kind !== "ONCE";
  const ariaLabel = blocked
    ? `Blocked — ${minutesToTime(entry.startMinutes)} to ${minutesToTime(entry.endMinutes)}`
    : useSubjectTheme
      ? `${entry.title} — ${entry.subtitle ?? "Class"} (${entry.enrolled}/${entry.effectiveCap})`
      : `${entry.title} — ${FILL_LABEL[status]} (${entry.enrolled}/${entry.effectiveCap})`;

  return (
    <TileBase
      type="button"
      onClick={interactive ? () => onClick(entry) : undefined}
      disabled={!interactive}
      $status={status}
      $blocked={blocked}
      $variant={variant}
      $interactive={interactive}
      $useSubjectTheme={useSubjectTheme}
      $subjectBg={subjectTheme?.bg}
      $subjectBgHover={subjectTheme?.bgHover}
      $subjectBorder={subjectTheme?.border}
      $subjectText={subjectTheme?.text}
      aria-label={ariaLabel}
      className={className}
    >
      {variant === "block" ? (
        <>
          <TitleSpan>{blocked ? "Blocked" : entry.title}</TitleSpan>
          <DimSpan>
            {minutesToTime(entry.startMinutes)}–{minutesToTime(entry.endMinutes)}
          </DimSpan>
          <DimSpan>
            {blocked
              ? "Reserved time"
              : useSubjectTheme
                ? `${entry.enrolled}/${entry.effectiveCap} enrolled`
                : status === "full"
                  ? "Full"
                  : `${entry.enrolled}/${entry.effectiveCap} enrolled`}
          </DimSpan>
        </>
      ) : variant === "month-bar" ? (
        <>
          <MonthBarAccent aria-hidden />
          <MonthBarText>
            {minutesToTime(entry.startMinutes)} {blocked ? "Blocked" : entry.title}
          </MonthBarText>
          {showsRecurrenceIcon ? (
            <RecurrenceIconWrap aria-hidden>
              <Repeat size={ICON_SIZE.XS} strokeWidth={ICON_STROKE.NORMAL} />
            </RecurrenceIconWrap>
          ) : null}
        </>
      ) : (
        <DimSpan>
          {minutesToTime(entry.startMinutes)} · {entry.title}
        </DimSpan>
      )}
    </TileBase>
  );
}
