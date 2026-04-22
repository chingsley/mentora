"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
  saveStudentInterestsAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";

export interface InterestSubject {
  id: string;
  name: string;
}

export interface StudentInterestsFormProps {
  allSubjects: InterestSubject[];
  initialSubjectIds: string[];
}

export function StudentInterestsForm({
  allSubjects,
  initialSubjectIds,
}: StudentInterestsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(initialSubjectIds),
  );

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
    const fd = new FormData();
    for (const id of selected) fd.append("subjectId", id);
    startTransition(async () => {
      const res = await saveStudentInterestsAction(fd);
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Pick the subjects you want to learn. We use these to recommend the right
        teachers for you.
      </p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {allSubjects.map((s) => {
          const isOn = selected.has(s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={isOn}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  isOn
                    ? "border-header bg-header text-white"
                    : "border-border bg-foreground text-header hover:bg-header/[0.03]"
                }`}
              >
                <span className="truncate font-medium">{s.name}</span>
                <span
                  aria-hidden
                  className={`h-4 w-4 shrink-0 rounded-full border ${
                    isOn ? "border-white bg-white" : "border-border"
                  }`}
                >
                  {isOn ? (
                    <svg viewBox="0 0 16 16" className="h-full w-full text-header" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M6.173 11.47a.75.75 0 0 1-1.06 0L2.72 9.078a.75.75 0 0 1 1.06-1.06l1.863 1.863 5.74-5.741a.75.75 0 1 1 1.06 1.06l-6.27 6.27Z"
                      />
                    </svg>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {result && !result.ok ? (
        <p className="text-sm text-destructive">{result.error}</p>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {selected.size} interest{selected.size === 1 ? "" : "s"} selected
        </p>
        <Button type="submit" isLoading={isPending}>
          Save interests
        </Button>
      </div>
    </form>
  );
}
