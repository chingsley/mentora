"use client";

import styled from "styled-components";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { minutesToTime } from "@/lib/time";
import { FILL_LABEL, FILL_THEME, fillStatus, type CalendarEntry, type FillStatus } from "./types";

export interface ClassTileProps {
  entry: CalendarEntry;
  onClick?: (entry: CalendarEntry) => void;
  variant?: "block" | "pill";
  className?: string;
}

const TileBase = styled.button<{ $status: FillStatus; $variant: "block" | "pill"; $interactive: boolean }>`
  display: ${(p) => (p.$variant === "block" ? "flex" : "inline-flex")};
  flex-direction: ${(p) => (p.$variant === "block" ? "column" : "row")};
  align-items: ${(p) => (p.$variant === "block" ? "stretch" : "center")};
  gap: ${(p) => (p.$variant === "block" ? "0.125rem" : "0.375rem")};
  width: 100%;
  overflow: hidden;
  text-align: left;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${(p) => FILL_THEME[p.$status].border};
  padding: ${(p) =>
    p.$variant === "block"
      ? `${SPACING.ONE} ${SPACING.TWO}`
      : `0.125rem ${SPACING.THREE}`};
  font-size: ${(p) => (p.$variant === "block" ? "0.6875rem" : "0.625rem")};
  line-height: ${FONTS.LINE_HEIGHT.SNUG};
  background-color: ${(p) => FILL_THEME[p.$status].bg};
  color: ${(p) => FILL_THEME[p.$status].text};
  cursor: ${(p) => (p.$interactive ? "pointer" : "default")};
  box-shadow: ${(p) => (p.$variant === "block" ? LAYOUT.SHADOW.SM : "none")};
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${(p) => FILL_THEME[p.$status].bgHover};
  }

  &:disabled {
    cursor: default;
  }
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

export function ClassTile({ entry, onClick, variant = "block", className }: ClassTileProps) {
  const status = fillStatus(entry);
  return (
    <TileBase
      type="button"
      onClick={onClick ? () => onClick(entry) : undefined}
      disabled={!onClick}
      $status={status}
      $variant={variant}
      $interactive={!!onClick}
      aria-label={`${entry.title} — ${FILL_LABEL[status]} (${entry.enrolled}/${entry.effectiveCap})`}
      className={className}
    >
      {variant === "block" ? (
        <>
          <TitleSpan>{entry.title}</TitleSpan>
          <DimSpan>
            {minutesToTime(entry.startMinutes)}–{minutesToTime(entry.endMinutes)}
          </DimSpan>
          <DimSpan>
            {status === "full" ? "Full" : `${entry.enrolled}/${entry.effectiveCap} enrolled`}
          </DimSpan>
        </>
      ) : (
        <DimSpan>
          {minutesToTime(entry.startMinutes)} · {entry.title}
        </DimSpan>
      )}
    </TileBase>
  );
}
