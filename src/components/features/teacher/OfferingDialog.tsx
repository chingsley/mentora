"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DAY_LABEL, DAY_ORDER, minutesToTime } from "@/lib/time";
import type { DayOfWeek } from "@prisma/client";
import {
  createOfferingAction,
  deleteOfferingAction,
  updateOfferingAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";

export interface OfferingDialogSubject {
  id: string;
  name: string;
  defaultCap: number;
}

export interface OfferingDialogValue {
  id?: string;
  title?: string;
  description?: string;
  subjectId?: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  teacherCap?: number;
}

export interface OfferingDialogProps {
  open: boolean;
  onClose: () => void;
  subjects: OfferingDialogSubject[];
  globalCap: number;
  initial: OfferingDialogValue | null;
}

export function OfferingDialog({
  open,
  onClose,
  subjects,
  globalCap,
  initial,
}: OfferingDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const isEdit = Boolean(initial?.id);

  const handleClose = React.useCallback(() => {
    setResult(null);
    onClose();
  }, [onClose]);

  if (!initial) return null;

  const defaultSubjectId = initial.subjectId ?? subjects[0]?.id ?? "";
  const defaultCap =
    initial.teacherCap ??
    subjects.find((s) => s.id === defaultSubjectId)?.defaultCap ??
    Math.min(10, globalCap);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const action = isEdit ? updateOfferingAction : createOfferingAction;
      if (isEdit && initial?.id) fd.append("offeringId", initial.id);
      const res = await action(fd);
      setResult(res);
      if (res.ok) {
        router.refresh();
        handleClose();
      }
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    const confirmed = window.confirm("Delete this class period? Active enrollments will be cancelled.");
    if (!confirmed) return;
    const fd = new FormData();
    fd.append("offeringId", initial.id);
    startTransition(async () => {
      const res = await deleteOfferingAction(fd);
      setResult(res);
      if (res.ok) {
        router.refresh();
        handleClose();
      }
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit class period" : "Add class period"}
      className="max-w-lg"
    >
      {subjects.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Pick at least one subject in your profile before scheduling classes.
          </p>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              name="title"
              label="Title"
              placeholder="e.g. Algebra I — Tuesday Group"
              defaultValue={initial.title ?? ""}
              required
              error={errs?.title}
            />
          </div>
          <Select
            name="subjectId"
            label="Subject"
            required
            defaultValue={defaultSubjectId}
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Select a subject"
            error={errs?.subjectId}
          />
          <Select
            name="dayOfWeek"
            label="Day"
            required
            defaultValue={initial.dayOfWeek}
            options={DAY_ORDER.map((d) => ({ value: d, label: DAY_LABEL[d] }))}
            error={errs?.dayOfWeek}
          />
          <Input
            name="startTime"
            type="time"
            label="Start time"
            defaultValue={minutesToTime(initial.startMinutes)}
            required
            error={errs?.startTime}
          />
          <Input
            name="endTime"
            type="time"
            label="End time"
            defaultValue={minutesToTime(initial.endMinutes)}
            required
            error={errs?.endMinutes}
          />
          <Input
            name="teacherCap"
            type="number"
            label={`Class cap (admin cap: ${globalCap})`}
            defaultValue={defaultCap}
            min={1}
            max={globalCap}
            required
            hint="Capped at the admin's global limit."
            error={errs?.teacherCap}
          />
          <div className="sm:col-span-2">
            <Input
              name="description"
              label="Description (optional)"
              defaultValue={initial.description ?? ""}
            />
          </div>
          {result && !result.ok && !result.fieldErrors ? (
            <p className="text-sm text-destructive sm:col-span-2">{result.error}</p>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
            <div>
              {isEdit ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  disabled={isPending}
                >
                  Delete period
                </Button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isPending}>
                {isEdit ? "Save changes" : "Add period"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Dialog>
  );
}
