"use client";

import { OfferingPeriodType } from "@prisma/client";
import styled, { css } from "styled-components";
import { Ban, Check, Clock, Lock, Minus, Repeat, UserX } from "lucide-react";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { COLORS } from "@/constants/colors.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import {
  SESSION_MARKER_LABEL,
  SESSION_MARKER_THEME,
  type SessionMarkerKind,
} from "@/constants/sessionOutcome.constants";
import { minutesToTime } from "@/lib/time";
import { subjectThemeForId } from "@/lib/subjectPalette";
import {
  BLOCKED_THEME,
  FILL_LABEL,
  FILL_THEME,
  fillStatus,
  type CalendarEntry,
  type CalendarEntryClickHandler,
  type CalendarTileColorMode,
  type FillStatus,
} from "./types";

export interface ClassTileProps {
  entry: CalendarEntry;
  onClick?: CalendarEntryClickHandler;
  clickDate?: Date;
  sessionMarker?: SessionMarkerKind | null;
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
  $sessionMarker?: SessionMarkerKind | null;
}>`
  position: relative;
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

  ${(p) =>
    p.$sessionMarker === "not_held" &&
    css`
      opacity: 0.72;
    `}
`;

const MonthBarAccent = styled.span`
  flex-shrink: 0;
  align-self: stretch;
  width: ${SPACING.HALF};
  border-radius: ${LAYOUT.RADIUS.SM};
  background-color: ${COLORS.CALENDAR_EVENT_ACCENT};
`;

const TitleRow = styled.span`
  display: flex;
  align-items: center;
  gap: ${SPACING.ONE};
  min-width: 0;
`;

const ReservedIconWrap = styled.span`
  flex-shrink: 0;
  display: inline-flex;
  color: ${COLORS.CALENDAR_RESERVED_ICON};
`;

const MonthBarText = styled.span`
  display: inline-flex;
  flex: 1 1 auto;
  align-items: center;
  gap: ${SPACING.ONE};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
`;

const MonthBarLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const MarkerBadge = styled.span<{ $kind: SessionMarkerKind }>`
  position: absolute;
  top: ${SPACING.ONE};
  right: ${SPACING.ONE};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(${SPACING.THREE} + ${SPACING.HALF});
  height: calc(${SPACING.THREE} + ${SPACING.HALF});
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.FOREGROUND};
  color: ${(p) => SESSION_MARKER_THEME[p.$kind].accent};
  box-shadow: ${LAYOUT.SHADOW.SM};
`;

const StrikethroughTitle = styled.span`
  text-decoration: line-through;
  text-decoration-color: ${COLORS.MUTED_FOREGROUND};
`;

function MarkerIcon({ kind }: { kind: SessionMarkerKind }) {
  const props = { size: ICON_SIZE.XS, strokeWidth: ICON_STROKE.MEDIUM };
  switch (kind) {
    case "attended":
      return <Check {...props} aria-hidden />;
    case "late":
      return <Clock {...props} aria-hidden />;
    case "absent":
      return <UserX {...props} aria-hidden />;
    case "excused":
      return <Ban {...props} aria-hidden />;
    case "not_held":
      return <Minus {...props} aria-hidden />;
    default:
      return null;
  }
}

export function ClassTile({
  entry,
  onClick,
  clickDate,
  sessionMarker = null,
  variant = "block",
  colorMode = "capacity",
  className,
}: ClassTileProps) {
  const blocked = entry.visibility === "blocked";
  const isReserved =
    !blocked && entry.periodType === OfferingPeriodType.RESERVED;
  const status = fillStatus(entry);
  const interactive = !!onClick && !blocked;
  const useSubjectTheme = colorMode === "subject" && !blocked;
  const subjectTheme = useSubjectTheme ? subjectThemeForId(entry.subjectId) : null;
  const showsRecurrenceIcon = !entry.recurrence || entry.recurrence.kind !== "ONCE";
  const enrollmentLine = blocked
    ? "Reserved time"
    : useSubjectTheme
      ? `${entry.enrolled}/${entry.effectiveCap} enrolled`
      : status === "full"
        ? "Full"
        : `${entry.enrolled}/${entry.effectiveCap} enrolled`;
  const metaLine = isReserved ? `Invite only · ${enrollmentLine}` : enrollmentLine;
  const ariaLabel = blocked
    ? `${entry.title} — ${minutesToTime(entry.startMinutes)} to ${minutesToTime(entry.endMinutes)}`
    : sessionMarker
      ? `${entry.title} — ${SESSION_MARKER_LABEL[sessionMarker]}`
      : isReserved
      ? `${entry.title} — Invite only (${entry.enrolled}/${entry.effectiveCap})`
      : useSubjectTheme
        ? `${entry.title} — ${entry.subtitle ?? "Class"} (${entry.enrolled}/${entry.effectiveCap})`
        : `${entry.title} — ${FILL_LABEL[status]} (${entry.enrolled}/${entry.effectiveCap})`;

  function handleClick() {
    if (!onClick || !interactive) return;
    onClick(entry, { date: clickDate ?? new Date() });
  }

  const titleContent =
    sessionMarker === "not_held" ? (
      <StrikethroughTitle>{entry.title}</StrikethroughTitle>
    ) : (
      entry.title
    );

  return (
    <TileBase
      type="button"
      onClick={interactive ? handleClick : undefined}
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
      $sessionMarker={sessionMarker}
      aria-label={ariaLabel}
      className={className}
    >
      {sessionMarker ? (
        <MarkerBadge $kind={sessionMarker} title={SESSION_MARKER_LABEL[sessionMarker]}>
          <MarkerIcon kind={sessionMarker} />
        </MarkerBadge>
      ) : null}
      {variant === "block" ? (
        <>
          <TitleRow>
            {isReserved ? (
              <ReservedIconWrap aria-hidden>
                <Lock size={ICON_SIZE.XS} strokeWidth={ICON_STROKE.MEDIUM} />
              </ReservedIconWrap>
            ) : null}
            <TitleSpan>{titleContent}</TitleSpan>
          </TitleRow>
          <DimSpan>
            {minutesToTime(entry.startMinutes)}–{minutesToTime(entry.endMinutes)}
          </DimSpan>
          <DimSpan>
            {sessionMarker ? SESSION_MARKER_LABEL[sessionMarker] : metaLine}
          </DimSpan>
        </>
      ) : variant === "month-bar" ? (
        <>
          <MonthBarAccent aria-hidden />
          <MonthBarText>
            {isReserved ? (
              <ReservedIconWrap aria-hidden>
                <Lock size={ICON_SIZE.XS} strokeWidth={ICON_STROKE.MEDIUM} />
              </ReservedIconWrap>
            ) : null}
            <MonthBarLabel>
              {minutesToTime(entry.startMinutes)} {sessionMarker === "not_held" ? (
                <StrikethroughTitle>{entry.title}</StrikethroughTitle>
              ) : (
                entry.title
              )}
            </MonthBarLabel>
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
