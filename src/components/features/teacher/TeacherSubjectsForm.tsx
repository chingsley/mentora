"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { saveSubjectsAction, type ActionResult } from "@/app/(app)/profile/actions";

export interface SubjectOption {
  id: string;
  name: string;
}

export interface TeacherSubjectsFormProps {
  allSubjects: SubjectOption[];
  initial: Array<{ subjectId: string; defaultCap: number | null }>;
  globalCap: number;
}

interface Row {
  selected: boolean;
  defaultCap: number;
}

export function TeacherSubjectsForm({
  allSubjects,
  initial,
  globalCap,
}: TeacherSubjectsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

  const initialMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const i of initial) map.set(i.subjectId, i.defaultCap ?? Math.min(10, globalCap));
    return map;
  }, [initial, globalCap]);

  const [rows, setRows] = React.useState<Record<string, Row>>(() => {
    const out: Record<string, Row> = {};
    for (const s of allSubjects) {
      const existing = initialMap.get(s.id);
      out[s.id] = {
        selected: existing !== undefined,
        defaultCap: existing ?? Math.min(10, globalCap),
      };
    }
    return out;
  });

  function toggle(id: string) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id]!, selected: !prev[id]!.selected } }));
  }

  function setCap(id: string, cap: number) {
    const clamped = Math.max(1, Math.min(globalCap, Math.floor(cap) || 1));
    setRows((prev) => ({ ...prev, [id]: { ...prev[id]!, defaultCap: clamped } }));
  }

  const selectedCount = Object.values(rows).filter((r) => r.selected).length;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subjects = Object.entries(rows)
      .filter(([, r]) => r.selected)
      .map(([subjectId, r]) => ({ subjectId, defaultCap: r.defaultCap }));
    const fd = new FormData();
    fd.append("subjects", JSON.stringify({ subjects }));
    startTransition(async () => {
      const res = await saveSubjectsAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Pick the subjects you teach. For each, set a class size limit that
        applies to new class periods (admin cap: {globalCap}).
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {allSubjects.map((s) => {
          const row = rows[s.id]!;
          return (
            <li
              key={s.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                row.selected ? "border-header/30 bg-header/[0.03]" : "border-border"
              }`}
            >
              <label className="flex min-w-0 flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={row.selected}
                  onChange={() => toggle(s.id)}
                  className="h-4 w-4 accent-header"
                />
                <span className="min-w-0 truncate text-sm font-medium text-header">
                  {s.name}
                </span>
              </label>
              <Input
                type="number"
                aria-label={`Class size limit for ${s.name}`}
                value={row.defaultCap}
                min={1}
                max={globalCap}
                disabled={!row.selected}
                onChange={(e) => setCap(s.id, Number(e.target.value))}
                className="h-9 w-24 text-right"
              />
            </li>
          );
        })}
      </ul>
      {result && !result.ok ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {selectedCount} subject{selectedCount === 1 ? "" : "s"} selected
        </p>
        <Button type="submit" isLoading={isPending} disabled={selectedCount === 0}>
          Save subjects
        </Button>
      </div>
    </form>
  );
}
