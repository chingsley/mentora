"use client";

import { OfferingPeriodType } from "@prisma/client";
import type { DayOfWeek } from "@prisma/client";
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
import type { OfferingDaySlot, OfferingDaySlotInput, OfferingScheduleEditorValue } from "@/lib/offeringSchedule";
import {
  defaultOfferingScheduleEditorValue,
  scheduleEditorValueFromSlots,
  slotsAndRecurrenceFromScheduleEditor,
  slotsFromMinutes,
} from "@/lib/offeringSchedule";
import {
  DEFAULT_OFFERING_RECURRENCE_INPUT,
  type OfferingRecurrence,
  type OfferingRecurrenceInput,
} from "@/lib/offeringRecurrence";
import {
  createOfferingAction,
  updateOfferingAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";
import { OfferingDaySlotsEditor } from "./OfferingDaySlotsEditor";
import {
  OfferingStudentInviteField,
  type OfferingInviteableStudent,
} from "./OfferingStudentInviteField";
import {
  OfferingDeletePeriodDialog,
  type OfferingDeletePeriodTarget,
} from "./OfferingDeletePeriodDialog";

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

const PERIOD_TYPE_OPTIONS = [
  { value: OfferingPeriodType.OPEN, label: "Open" },
  { value: OfferingPeriodType.RESERVED, label: "Reserved (invite only)" },
] as const;

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
  slots?: OfferingDaySlot[];
  scheduleGroupId?: string | null;
  startMinutes: number;
  endMinutes: number;
  periodType?: OfferingPeriodType;
  teacherCap?: number;
  invitedStudentProfileIds?: string[];
  enrolled?: number;
  groupEnrolled?: number;
  groupDayCount?: number;
  recurrence?: OfferingRecurrence;
}

export interface OfferingDialogProps {
  open: boolean;
  onClose: () => void;
  subjects: OfferingDialogSubject[];
  inviteableStudents: OfferingInviteableStudent[];
  globalCap: number;
  initial: OfferingDialogValue | null;
}

function classLimitForSubject(
  subjectId: string,
  subjects: OfferingDialogSubject[],
  globalCap: number,
): number {
  const subject = subjects.find((s) => s.id === subjectId);
  return subject?.defaultCap ?? globalCap;
}

function fieldError(
  fieldErrors: Record<string, string> | undefined,
  key: string,
): string | undefined {
  const msg = fieldErrors?.[key];
  return msg && msg.length > 0 ? msg : undefined;
}

function initialSchedule(initial: OfferingDialogValue): OfferingScheduleEditorValue {
  const slots: OfferingDaySlotInput[] = initial.slots?.length
    ? slotsFromMinutes(initial.slots)
    : slotsFromMinutes([
        {
          dayOfWeek: initial.dayOfWeek,
          startMinutes: initial.startMinutes,
          endMinutes: initial.endMinutes,
        },
      ]);

  const recurrence: OfferingRecurrenceInput = initial.recurrence
    ? {
        kind: initial.recurrence.kind,
        anchorDate: initial.recurrence.anchorDate ?? "",
        ordinal: initial.recurrence.ordinal ?? "",
        interval: initial.recurrence.interval ?? "",
      }
    : DEFAULT_OFFERING_RECURRENCE_INPUT;

  return scheduleEditorValueFromSlots(slots, recurrence);
}

export function OfferingDialog({
  open,
  onClose,
  subjects,
  inviteableStudents,
  globalCap,
  initial,
}: OfferingDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [subjectId, setSubjectId] = React.useState("");
  const [periodType, setPeriodType] = React.useState<OfferingPeriodType>(OfferingPeriodType.OPEN);
  const [teacherCap, setTeacherCap] = React.useState("");
  const [invitedIds, setInvitedIds] = React.useState<string[]>([]);
  const [schedule, setSchedule] = React.useState<OfferingScheduleEditorValue>(
    defaultOfferingScheduleEditorValue(),
  );
  const [deleteTarget, setDeleteTarget] = React.useState<OfferingDeletePeriodTarget | null>(null);
  const isEdit = Boolean(initial?.id);

  const handleClose = React.useCallback(() => {
    setResult(null);
    setSubjectId("");
    setPeriodType(OfferingPeriodType.OPEN);
    setTeacherCap("");
    setInvitedIds([]);
    setSchedule(defaultOfferingScheduleEditorValue());
    onClose();
  }, [onClose]);

  React.useEffect(() => {
    if (!open || !initial) return;

    setResult(null);
    setSchedule(initialSchedule(initial));

    if (isEdit && initial.subjectId) {
      setSubjectId(initial.subjectId);
      setPeriodType(initial.periodType ?? OfferingPeriodType.OPEN);
      setInvitedIds(initial.invitedStudentProfileIds ?? []);
      if ((initial.periodType ?? OfferingPeriodType.OPEN) === OfferingPeriodType.OPEN) {
        setTeacherCap(
          String(
            initial.teacherCap ?? classLimitForSubject(initial.subjectId, subjects, globalCap),
          ),
        );
      } else {
        setTeacherCap("");
      }
      return;
    }

    setSubjectId("");
    setPeriodType(OfferingPeriodType.OPEN);
    setTeacherCap("");
    setInvitedIds([]);
  }, [open, initial, isEdit, subjects, globalCap]);

  function handleSubjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextSubjectId = e.target.value;
    setSubjectId(nextSubjectId);
    if (periodType === OfferingPeriodType.OPEN && nextSubjectId) {
      setTeacherCap(String(classLimitForSubject(nextSubjectId, subjects, globalCap)));
    }
  }

  function handlePeriodTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OfferingPeriodType;
    setPeriodType(next);
    if (next === OfferingPeriodType.OPEN && subjectId) {
      setTeacherCap(String(classLimitForSubject(subjectId, subjects, globalCap)));
    } else {
      setTeacherCap("");
    }
  }

  if (!initial) return null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("periodType", periodType);
    const { slots, recurrence } = slotsAndRecurrenceFromScheduleEditor(schedule);
    fd.set("recurrenceKind", recurrence.kind);
    if (recurrence.anchorDate) fd.set("recurrenceAnchorDate", recurrence.anchorDate);
    if (recurrence.ordinal !== "") fd.set("recurrenceOrdinal", String(recurrence.ordinal));
    if (recurrence.interval !== "") fd.set("recurrenceInterval", String(recurrence.interval));
    slots.forEach((slot, index) => {
      fd.set(`slots[${index}].dayOfWeek`, slot.dayOfWeek);
      fd.set(`slots[${index}].startTime`, slot.startTime);
      fd.set(`slots[${index}].endTime`, slot.endTime);
    });
    if (periodType === OfferingPeriodType.RESERVED) {
      fd.delete("teacherCap");
    }
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

  function onDeleteClick() {
    if (!initial?.id) return;
    setDeleteTarget({
      offeringId: initial.id,
      enrolled: initial.groupEnrolled ?? initial.enrolled ?? 0,
      dayCount: initial.groupDayCount ?? slotsAndRecurrenceFromScheduleEditor(schedule).slots.length,
    });
  }

  function onDeleteClose() {
    setDeleteTarget(null);
  }

  function onDeleted() {
    handleClose();
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;
  const isOpenPeriod = periodType === OfferingPeriodType.OPEN;

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
              placeholder="e.g. Math 101 — Algebra I"
              defaultValue={initial.title ?? ""}
              required
              error={errs?.title}
            />
          </Span2>
          <Select
            name="subjectId"
            label="Subject"
            required
            value={subjectId}
            onChange={handleSubjectChange}
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Select a subject"
            error={errs?.subjectId}
          />
          <Span2>
            <OfferingDaySlotsEditor
              schedule={schedule}
              onChange={setSchedule}
              fieldErrors={errs}
              disabled={isPending}
            />
          </Span2>
          <Select
            name="periodType"
            label="Class type"
            required
            value={periodType}
            onChange={handlePeriodTypeChange}
            options={[...PERIOD_TYPE_OPTIONS]}
            error={errs?.periodType}
          />
          {isOpenPeriod ? (
            <Input
              name="teacherCap"
              type="number"
              label={`Class cap (admin cap: ${globalCap})`}
              value={teacherCap}
              onChange={(e) => setTeacherCap(e.target.value)}
              min={1}
              max={globalCap}
              required
              hint="Anyone can sign up until this cap is reached."
              error={errs?.teacherCap}
            />
          ) : (
            <Span2>
              <OfferingStudentInviteField
                students={inviteableStudents}
                selectedIds={invitedIds}
                onChange={setInvitedIds}
                error={fieldError(errs, "invitedStudentProfileIds")}
                disabled={isPending}
              />
            </Span2>
          )}
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
                  onClick={onDeleteClick}
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
      <OfferingDeletePeriodDialog
        target={deleteTarget}
        onClose={onDeleteClose}
        onDeleted={onDeleted}
      />
    </Dialog>
  );
}
