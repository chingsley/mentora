"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
  clearRateAction,
  saveRateAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";

export interface RateSubject {
  id: string;
  name: string;
}

export interface RateRegion {
  id: string;
  code: string;
  name: string;
  currency: string;
  minMajor: number;
}

export interface RateCell {
  subjectId: string;
  regionCode: string;
  hourlyMajor: number;
}

export interface TeacherRatesGridProps {
  subjects: RateSubject[];
  regions: RateRegion[];
  rates: RateCell[];
}

export function TeacherRatesGrid({ subjects, regions, rates }: TeacherRatesGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [editing, setEditing] = React.useState<string | null>(null);
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const rateMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rates) map.set(key(r.subjectId, r.regionCode), r.hourlyMajor);
    return map;
  }, [rates]);

  function key(subjectId: string, regionCode: string) {
    return `${subjectId}::${regionCode}`;
  }

  function startEdit(subjectId: string, regionCode: string) {
    const current = rateMap.get(key(subjectId, regionCode));
    setEditing(key(subjectId, regionCode));
    setValue(current !== undefined ? String(current) : "");
    setError(null);
  }

  function onSave(subjectId: string, regionCode: string) {
    setError(null);
    const fd = new FormData();
    fd.append("subjectId", subjectId);
    fd.append("regionCode", regionCode);
    fd.append("hourlyRateMajor", value);
    startTransition(async () => {
      const res: ActionResult = await saveRateAction(fd);
      if (!res.ok) {
        setError(res.fieldErrors?.hourlyRateMajor ?? res.error);
        return;
      }
      setEditing(null);
      router.refresh();
    });
  }

  function onClear(subjectId: string, regionCode: string) {
    const fd = new FormData();
    fd.append("subjectId", subjectId);
    fd.append("regionCode", regionCode);
    startTransition(async () => {
      await clearRateAction(fd);
      setEditing(null);
      router.refresh();
    });
  }

  if (subjects.length === 0) {
    return (
      <p className="rounded-md bg-background p-4 text-sm text-muted-foreground">
        Pick your subjects above first — you&apos;ll then be able to set a
        per-subject hourly rate for each region.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-foreground px-3 py-2 text-left font-medium text-header">
              Subject
            </th>
            {regions.map((r) => (
              <th
                key={r.code}
                className="px-3 py-2 text-left font-medium text-header"
              >
                <div className="flex flex-col">
                  <span>{r.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {r.currency} &middot; min {r.minMajor}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => (
            <tr key={s.id} className="align-top">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-foreground px-3 py-3 text-left text-sm font-medium text-header"
              >
                {s.name}
              </th>
              {regions.map((r) => {
                const cellKey = key(s.id, r.code);
                const current = rateMap.get(cellKey);
                const isEditing = editing === cellKey;
                return (
                  <td
                    key={r.code}
                    className="border-t border-border px-3 py-3 align-middle"
                  >
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.01"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={`${r.minMajor}`}
                            className="h-9 w-28 rounded-md border border-border bg-foreground px-2 text-right text-sm"
                            autoFocus
                          />
                          <span className="text-xs text-muted-foreground">{r.currency}/hr</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onSave(s.id, r.code)}
                            isLoading={isPending}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditing(null)}
                          >
                            Cancel
                          </Button>
                          {current !== undefined ? (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => onClear(s.id, r.code)}
                            >
                              Remove
                            </Button>
                          ) : null}
                        </div>
                        {error ? <p className="text-xs text-destructive">{error}</p> : null}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(s.id, r.code)}
                        className="flex w-full items-center justify-between gap-2 rounded-md border border-dashed border-border px-3 py-2 text-left transition-colors hover:border-header/30 hover:bg-header/[0.03]"
                      >
                        {current !== undefined ? (
                          <span className="font-medium text-header">
                            {current} {r.currency}/hr
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Set rate</span>
                        )}
                        <span aria-hidden className="text-xs text-muted-foreground">
                          {current !== undefined ? "Edit" : "+"}
                        </span>
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
