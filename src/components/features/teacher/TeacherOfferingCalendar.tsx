"use client";

import type { DayOfWeek, OfferingPeriodType, OfferingRecurrenceKind } from "@prisma/client";
import * as React from "react";
import styled from "styled-components";
import { AppCalendar } from "@/components/features/calendar";
import type { CalendarEntry } from "@/components/features/calendar/types";
import {
  OfferingDialog,
  type OfferingDialogSubject,
  type OfferingDialogValue,
} from "@/components/features/teacher/OfferingDialog";
import { TeacherSessionAttendanceDialog } from "@/components/features/teacher/TeacherSessionAttendanceDialog";
import type { OfferingInviteableStudent } from "@/components/features/teacher/OfferingStudentInviteField";
import { canTakeSessionAttendance } from "@/lib/sessionAttendance";
import { buildOfferingDialogInitial } from "@/lib/offeringSchedule";
import { offeringCapacity } from "@/lib/offeringCapacity";
import { recurrenceFromDb } from "@/lib/offeringRecurrence";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const EmptyState = styled.div`
  border-radius: ${LAYOUT.RADIUS.LG};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.FOUR};
  text-align: center;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface TeacherOfferingCalendarOffering {
  id: string;
  title: string;
  description?: string | null;
  subjectId: string;
  subjectName: string;
  scheduleGroupId: string | null;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  periodType: OfferingPeriodType;
  teacherCap: number;
  enrolled: number;
  invitedStudentProfileIds: string[];
  recurrenceKind: OfferingRecurrenceKind;
  recurrenceAnchorDate: Date | null;
  recurrenceOrdinal: number | null;
  hourlyRate: number;
  createdAt: Date;
}

export interface TeacherOfferingCalendarProps {
  offerings: TeacherOfferingCalendarOffering[];
  subjects: OfferingDialogSubject[];
  inviteableStudents: OfferingInviteableStudent[];
  globalCap: number;
  billingCurrency: string;
  regionMinHourlyMajor: number | null;
  emptyStateMessage?: string;
  initialView?: "day" | "week" | "month";
  tileColorMode?: "capacity" | "subject";
}

function toDialogOfferingRow(o: TeacherOfferingCalendarOffering) {
  return {
    id: o.id,
    scheduleGroupId: o.scheduleGroupId,
    dayOfWeek: o.dayOfWeek,
    title: o.title,
    description: o.description,
    subjectId: o.subjectId,
    startMinutes: o.startMinutes,
    endMinutes: o.endMinutes,
    periodType: o.periodType,
    teacherCap: o.teacherCap,
    invitedStudentProfileIds: o.invitedStudentProfileIds,
    enrolled: o.enrolled,
    hourlyRate: o.hourlyRate,
    recurrenceKind: o.recurrenceKind,
    recurrenceAnchorDate: o.recurrenceAnchorDate,
    recurrenceOrdinal: o.recurrenceOrdinal,
  };
}

function offeringRecurrence(o: TeacherOfferingCalendarOffering) {
  return recurrenceFromDb({
    recurrenceKind: o.recurrenceKind,
    recurrenceAnchorDate: o.recurrenceAnchorDate,
    recurrenceOrdinal: o.recurrenceOrdinal,
    scheduleStartFallback: o.createdAt,
  });
}

export function TeacherOfferingCalendar({
  offerings,
  subjects,
  inviteableStudents,
  globalCap,
  billingCurrency,
  regionMinHourlyMajor,
  emptyStateMessage = "No class periods yet. Click an empty slot on the day or week view to add one.",
  initialView = "week",
  tileColorMode = "subject",
}: TeacherOfferingCalendarProps) {
  const [dialog, setDialog] = React.useState<OfferingDialogValue | null>(null);
  const [attendanceTarget, setAttendanceTarget] = React.useState<{
    offering: TeacherOfferingCalendarOffering;
    date: Date;
  } | null>(null);

  const entries: CalendarEntry[] = offerings.map((o) => ({
    id: o.id,
    offeringId: o.id,
    title: o.title,
    subtitle: o.subjectName,
    subjectId: o.subjectId,
    dayOfWeek: o.dayOfWeek,
    startMinutes: o.startMinutes,
    endMinutes: o.endMinutes,
    enrolled: o.enrolled,
    effectiveCap: offeringCapacity({
      periodType: o.periodType,
      globalClassCap: globalCap,
      teacherCap: o.teacherCap,
      inviteCount: o.invitedStudentProfileIds.length,
      currentEnrolled: o.enrolled,
    }).effectiveCap,
    recurrence: offeringRecurrence(o),
    periodType: o.periodType,
  }));

  const dialogRows = React.useMemo(
    () => offerings.map(toDialogOfferingRow),
    [offerings],
  );

  function onEntryClick(entry: CalendarEntry, meta: { date: Date }) {
    const original = offerings.find((o) => o.id === entry.offeringId);
    if (!original) return;
    if (canTakeSessionAttendance(meta.date, original.startMinutes)) {
      setAttendanceTarget({ offering: original, date: meta.date });
      return;
    }
    openEditSchedule(original);
  }

  function openEditSchedule(offering: TeacherOfferingCalendarOffering) {
    setAttendanceTarget(null);
    setDialog(buildOfferingDialogInitial(toDialogOfferingRow(offering), dialogRows));
  }

  function onEmptySlotClick(info: { dayOfWeek: DayOfWeek; minutes: number }) {
    const startMinutes = info.minutes;
    const endMinutes = Math.min(22 * 60, startMinutes + 60);
    setDialog({ dayOfWeek: info.dayOfWeek, startMinutes, endMinutes });
  }

  return (
    <>
      <AppCalendar
        entries={entries}
        initialView={initialView}
        tileColorMode={tileColorMode}
        onEntryClick={onEntryClick}
        onEmptySlotClick={onEmptySlotClick}
        emptyState={<EmptyState>{emptyStateMessage}</EmptyState>}
      />
      <OfferingDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        subjects={subjects}
        inviteableStudents={inviteableStudents}
        globalCap={globalCap}
        billingCurrency={billingCurrency}
        regionMinHourlyMajor={regionMinHourlyMajor}
        initial={dialog}
      />
      <TeacherSessionAttendanceDialog
        open={attendanceTarget !== null}
        onClose={() => setAttendanceTarget(null)}
        offering={attendanceTarget?.offering ?? null}
        sessionDate={attendanceTarget?.date ?? null}
        onEditSchedule={openEditSchedule}
      />
    </>
  );
}
