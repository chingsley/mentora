"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { DAY_LABEL, minutesToTime } from "@/lib/time";
import type { DayOfWeek } from "@prisma/client";
import { enrollAction, type EnrollResult } from "./actions";

export interface EnrollablePeriod {
  id: string;
  subjectName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  effectiveCap: number;
  enrolled: number;
  isFull: boolean;
}

export interface EnrollFormProps {
  teacherId: string;
  periods: EnrollablePeriod[];
  canEnroll: boolean;
}

export function EnrollForm({ periods, canEnroll }: EnrollFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [result, setResult] = React.useState<EnrollResult | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canEnroll || selected.size === 0) return;
    const fd = new FormData();
    for (const id of selected) fd.append("offeringId", id);
    startTransition(async () => {
      const res = await enrollAction(fd);
      setResult(res);
      if (res.ok) {
        setSelected(new Set());
        router.refresh();
      }
    });
  }

  if (periods.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This teacher hasn&apos;t published any periods yet.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <ul className="divide-y divide-border">
        {periods.map((p) => {
          const disabled = p.isFull;
          const isChecked = selected.has(p.id);
          return (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={disabled || !canEnroll}
                  onChange={() => toggle(p.id)}
                  className="h-4 w-4"
                  name="offeringId"
                  value={p.id}
                />
                <span>
                  <span className="block font-medium text-header">
                    {DAY_LABEL[p.dayOfWeek]}{" "}
                    {minutesToTime(p.startMinutes)}–{minutesToTime(p.endMinutes)}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {p.subjectName}
                  </span>
                </span>
              </label>
              <span className={disabled ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                {disabled
                  ? "Full"
                  : `${p.enrolled}/${p.effectiveCap} enrolled`}
              </span>
            </li>
          );
        })}
      </ul>

      {!canEnroll ? (
        <p className="text-sm text-muted-foreground">
          Only students can enroll in classes. Sign in with a student account.
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={selected.size === 0} isLoading={isPending}>
            Enroll in {selected.size || ""} period{selected.size === 1 ? "" : "s"}
          </Button>
          {result?.ok ? (
            <p className="text-sm text-success">
              Enrolled in {result.results.filter((r) => r.enrolled).length} period
              {result.results.filter((r) => r.enrolled).length === 1 ? "" : "s"}.
            </p>
          ) : null}
          {result && !result.ok ? (
            <p className="text-sm text-destructive">{result.error}</p>
          ) : null}
        </div>
      )}
    </form>
  );
}
