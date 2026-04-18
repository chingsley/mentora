"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updatePolicyAction, type PolicyActionResult } from "./actions";

export interface PolicyFormProps {
  initial: {
    globalClassCap: number;
    commissionPercent: number;
    attendanceThresholdPct: number;
  };
}

export function PolicyForm({ initial }: PolicyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<PolicyActionResult | null>(null);

  React.useEffect(() => {
    if (!result?.ok) return;
    const id = window.setTimeout(() => setResult(null), 4000);
    return () => window.clearTimeout(id);
  }, [result]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updatePolicyAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3">
      <Input
        name="globalClassCap"
        type="number"
        min={1}
        max={1000}
        label="Global class cap"
        defaultValue={initial.globalClassCap}
        required
        error={errs?.globalClassCap}
        hint="Teachers cannot exceed this per period."
      />
      <Input
        name="commissionPercent"
        type="number"
        min={0}
        max={50}
        label="Commission (%)"
        defaultValue={initial.commissionPercent}
        required
        error={errs?.commissionPercent}
      />
      <Input
        name="attendanceThresholdPct"
        type="number"
        min={10}
        max={100}
        label="Attendance threshold (%)"
        defaultValue={initial.attendanceThresholdPct}
        required
        error={errs?.attendanceThresholdPct}
        hint="Required presence to mark attendance."
      />
      <div className="flex flex-col items-end gap-2 sm:col-span-3">
        <div className="relative h-14 w-full shrink-0">
          {result?.ok ? (
            <p
              className="absolute inset-0 flex items-center justify-end"
              role="status"
              aria-live="polite"
            >
              <span className="max-w-full rounded-md px-3 py-1.5 text-sm text-success">
                Settings saved.
              </span>
            </p>
          ) : null}
          {result && !result.ok && !result.fieldErrors ? (
            <p
              className="absolute inset-0 flex items-center justify-end"
              role="alert"
              aria-live="assertive"
            >
              <span
                className="max-w-full rounded-md border border-destructive/25 bg-destructive/5 px-3 py-1.5 text-right text-sm leading-snug text-destructive line-clamp-2"
                title={result.error}
              >
                {result.error}
              </span>
            </p>
          ) : null}
        </div>
        <Button type="submit" isLoading={isPending}>
          Save policy
        </Button>
      </div>
    </form>
  );
}
