"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { DAY_LABEL, DAY_ORDER, minutesToTime } from "@/lib/time";
import type { DayOfWeek } from "@prisma/client";
import {
  createOfferingAction,
  deleteOfferingAction,
  updateOfferingAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const EmptyText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const EmptyActions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const FormGrid = styled.form`
  display: grid;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Span2 = styled.div`
  ${LAYOUT.MEDIA.SM} {
    grid-column: span 2 / span 2;
  }
`;

const FormError = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};

  ${LAYOUT.MEDIA.SM} {
    grid-column: span 2 / span 2;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    grid-column: span 2 / span 2;
  }
`;

const FooterActions = styled.div`
  display: flex;
  gap: ${SPACING.TWO};
`;

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
      size="lg"
    >
      {subjects.length === 0 ? (
        <EmptyWrap>
          <EmptyText>
            Pick at least one subject in your profile before scheduling classes.
          </EmptyText>
          <EmptyActions>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </EmptyActions>
        </EmptyWrap>
      ) : (
        <FormGrid onSubmit={onSubmit}>
          <Span2>
            <Input
              name="title"
              label="Title"
              placeholder="e.g. Algebra I — Tuesday Group"
              defaultValue={initial.title ?? ""}
              required
              error={errs?.title}
            />
          </Span2>
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
          <Span2>
            <Input
              name="description"
              label="Description (optional)"
              defaultValue={initial.description ?? ""}
            />
          </Span2>
          {result && !result.ok && !result.fieldErrors ? (
            <FormError>{result.error}</FormError>
          ) : null}
          <Footer>
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
            <FooterActions>
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isPending}>
                {isEdit ? "Save changes" : "Add period"}
              </Button>
            </FooterActions>
          </Footer>
        </FormGrid>
      )}
    </Dialog>
  );
}
