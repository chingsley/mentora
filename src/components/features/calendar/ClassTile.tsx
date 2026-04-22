"use client";

import { minutesToTime } from "@/lib/time";
import {
  FILL_CLASSES,
  FILL_LABEL,
  fillStatus,
  type CalendarEntry,
} from "./types";

export interface ClassTileProps {
  entry: CalendarEntry;
  onClick?: (entry: CalendarEntry) => void;
  variant?: "block" | "pill";
  className?: string;
}

export function ClassTile({ entry, onClick, variant = "block", className = "" }: ClassTileProps) {
  const status = fillStatus(entry);
  const base =
    variant === "block"
      ? "flex flex-col gap-0.5 overflow-hidden rounded-md border px-2 py-1 text-left text-[11px] leading-tight shadow-sm transition-colors"
      : "inline-flex w-full items-center gap-1.5 truncate rounded-md border px-1.5 py-0.5 text-left text-[10px] leading-tight transition-colors";
  const interactive = onClick ? "cursor-pointer" : "cursor-default";

  return (
    <button
      type="button"
      onClick={onClick ? () => onClick(entry) : undefined}
      disabled={!onClick}
      aria-label={`${entry.title} — ${FILL_LABEL[status]} (${entry.enrolled}/${entry.effectiveCap})`}
      className={`${base} ${FILL_CLASSES[status]} ${interactive} ${className}`.trim()}
    >
      {variant === "block" ? (
        <>
          <span className="truncate font-semibold">{entry.title}</span>
          <span className="truncate opacity-80">
            {minutesToTime(entry.startMinutes)}–{minutesToTime(entry.endMinutes)}
          </span>
          <span className="truncate opacity-80">
            {status === "full"
              ? "Full"
              : `${entry.enrolled}/${entry.effectiveCap} enrolled`}
          </span>
        </>
      ) : (
        <span className="truncate">
          {minutesToTime(entry.startMinutes)} · {entry.title}
        </span>
      )}
    </button>
  );
}
