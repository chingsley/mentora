"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
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

const SUBJECT_PALETTE = [
  "bg-indigo-100 text-indigo-900 border-indigo-300",
  "bg-emerald-100 text-emerald-900 border-emerald-300",
  "bg-amber-100 text-amber-900 border-amber-300",
  "bg-sky-100 text-sky-900 border-sky-300",
  "bg-rose-100 text-rose-900 border-rose-300",
  "bg-violet-100 text-violet-900 border-violet-300",
  "bg-teal-100 text-teal-900 border-teal-300",
  "bg-orange-100 text-orange-900 border-orange-300",
] as const;

function subjectColor(subjectId: string): string {
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
      {/* Desktop weekly grid */}
      <div className="hidden md:block">
        <div
          className="grid border-border"
          style={{ gridTemplateColumns: "5rem repeat(7, minmax(0, 1fr))" }}
        >
          <div aria-hidden className="sticky left-0 z-10 bg-foreground" />
          {DAY_ORDER.map((d) => (
            <div
              key={d}
              className="border-b border-border bg-foreground px-2 py-2 text-center text-xs font-semibold text-header"
            >
              {DAY_LABEL[d].slice(0, 3)}
            </div>
          ))}

          <div
            className="relative border-t border-border bg-foreground"
            style={{ height: SLOTS * SLOT_PX }}
          >
            {Array.from({ length: HOURS + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute right-2 -translate-y-1/2 text-[10px] text-muted-foreground"
                style={{ top: i * (SLOT_PX * (60 / SLOT_MINUTES)) }}
              >
                {minutesToTime((START_HOUR + i) * 60)}
              </div>
            ))}
          </div>

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
        </div>
      </div>

      {/* Mobile stacked list */}
      <div className="flex flex-col gap-4 md:hidden">
        {DAY_ORDER.map((d) => {
          const list = byDay.get(d) ?? [];
          return (
            <section key={d} className="rounded-lg border border-border bg-foreground">
              <header className="flex items-center justify-between border-b border-border px-3 py-2">
                <h3 className="text-sm font-semibold text-header">{DAY_LABEL[d]}</h3>
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
              </header>
              {list.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">No periods.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {list.map((o) => (
                    <li key={o.id}>
                      <button
                        type="button"
                        onClick={() => openEdit(o)}
                        disabled={readOnly}
                        className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors ${
                          readOnly ? "cursor-default" : "hover:bg-header/[0.03]"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-header">{o.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {o.subjectName} &middot; {minutesToTime(o.startMinutes)}–
                            {minutesToTime(o.endMinutes)}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-header">
                          {o.enrolled}/{o.teacherCap}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

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
    <div
      className={`relative border-t border-l border-border bg-foreground ${readOnly ? "" : "cursor-cell"}`}
      style={{ height: SLOTS * SLOT_PX }}
      onClick={onColumnClick}
      role={readOnly ? undefined : "button"}
      aria-label={readOnly ? undefined : `Add period on ${DAY_LABEL[day]}`}
    >
      {Array.from({ length: HOURS }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border/60"
          style={{ top: (i + 1) * (SLOT_PX * (60 / SLOT_MINUTES)) }}
        />
      ))}
      {offerings.map((o) => {
        const startSlot = Math.max(0, (o.startMinutes - START_HOUR * 60) / SLOT_MINUTES);
        const endSlot = Math.min(SLOTS, (o.endMinutes - START_HOUR * 60) / SLOT_MINUTES);
        const top = startSlot * SLOT_PX;
        const height = Math.max(SLOT_PX, (endSlot - startSlot) * SLOT_PX - 2);
        return (
          <button
            key={o.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(o);
            }}
            disabled={readOnly}
            className={`absolute left-1 right-1 overflow-hidden rounded-md border px-2 py-1 text-left text-[11px] leading-tight shadow-sm transition-shadow ${
              readOnly ? "cursor-default" : "hover:shadow-md"
            } ${subjectColor(o.subjectId)}`}
            style={{ top, height }}
          >
            <p className="truncate font-semibold">{o.title}</p>
            <p className="truncate opacity-80">
              {minutesToTime(o.startMinutes)}–{minutesToTime(o.endMinutes)}
            </p>
            <p className="truncate opacity-80">
              {o.enrolled}/{o.teacherCap}
            </p>
          </button>
        );
      })}
    </div>
  );
}
