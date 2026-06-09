"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { CalendarShell } from "@/components/features/calendar/CalendarShell";
import type { CalendarOccurrenceLookup } from "@/components/features/calendar/types";
import {
  ClassDetailsDialog,
  type ClassDetail,
} from "@/components/features/class/ClassDetailsDialog";
import { buildCalendarOccurrenceLookup, getOccurrenceSnapshot } from "@/lib/calendarOccurrenceLookup";
import type { SessionOccurrenceSnapshot } from "@/lib/sessionOccurrenceKey";
import {
  SESSION_MARKER_LABEL,
  SESSION_MARKER_THEME,
} from "@/constants/sessionOutcome.constants";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { StudentClassRow } from "@/types/studentClass";
import { dropAction } from "@/app/(app)/classes/actions";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.META};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
`;

const LegendDot = styled.span<{ $color: string }>`
  width: ${SPACING.TWO};
  height: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${(p) => p.$color};
`;

export interface TeacherDetailStudentScheduleProps {
  rows: StudentClassRow[];
  occurrenceMap: Record<string, SessionOccurrenceSnapshot>;
  studentDisplayName: string;
}

export function TeacherDetailStudentSchedule({
  rows,
  occurrenceMap,
  studentDisplayName,
}: TeacherDetailStudentScheduleProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [pendingOfferingId, setPendingOfferingId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<
    { tone: "success" | "error"; text: string } | null
  >(null);

  const entries = rows.map((r) => r.entry);
  const detailsByOfferingId = React.useMemo(() => {
    const map: Record<string, ClassDetail> = {};
    for (const r of rows) map[r.entry.offeringId] = r.detail;
    return map;
  }, [rows]);
  const enrollmentByOfferingId = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const r of rows) map[r.entry.offeringId] = r.enrollmentId;
    return map;
  }, [rows]);

  const occurrenceLookup: CalendarOccurrenceLookup = React.useMemo(
    () => buildCalendarOccurrenceLookup(occurrenceMap),
    [occurrenceMap],
  );

  const detail = selectedId ? detailsByOfferingId[selectedId] ?? null : null;
  const enrollmentId = selectedId ? enrollmentByOfferingId[selectedId] ?? null : null;
  const selectedEntry = selectedId ? entries.find((e) => e.offeringId === selectedId) ?? null : null;
  const sessionSnapshot =
    selectedEntry && selectedDate
      ? getOccurrenceSnapshot(occurrenceMap, selectedEntry, selectedDate)
      : null;

  function onClose() {
    setSelectedId(null);
    setSelectedDate(null);
    setMessage(null);
  }

  const [, startTransition] = React.useTransition();

  function handleDrop(id: string, offeringId: string) {
    setPendingOfferingId(offeringId);
    const fd = new FormData();
    fd.append("enrollmentId", id);
    startTransition(async () => {
      try {
        await dropAction(fd);
        setMessage({
          tone: "success",
          text: "You've been removed from this class.",
        });
        router.refresh();
      } finally {
        setPendingOfferingId(null);
      }
    });
  }

  return (
    <Wrap>
      <Legend aria-label="Past session markers">
        <LegendItem>
          <LegendDot $color={SESSION_MARKER_THEME.attended.accent} aria-hidden />
          {SESSION_MARKER_LABEL.attended}
        </LegendItem>
        <LegendItem>
          <LegendDot $color={SESSION_MARKER_THEME.absent.accent} aria-hidden />
          {SESSION_MARKER_LABEL.absent}
        </LegendItem>
        <LegendItem>
          <LegendDot $color={SESSION_MARKER_THEME.not_held.accent} aria-hidden />
          {SESSION_MARKER_LABEL.not_held}
        </LegendItem>
      </Legend>
      <CalendarShell
        entries={entries}
        occurrenceLookup={occurrenceLookup}
        tileColorMode="subject"
        onEntryClick={(e, meta) => {
          setSelectedId(e.offeringId);
          setSelectedDate(meta.date);
          setMessage(null);
        }}
      />
      <ClassDetailsDialog
        open={selectedId !== null}
        onClose={onClose}
        detail={detail}
        viewerRole="STUDENT"
        enrollmentId={enrollmentId}
        sessionSnapshot={sessionSnapshot}
        studentDisplayName={studentDisplayName}
        isBusy={pendingOfferingId !== null && pendingOfferingId === selectedId}
        message={message}
        onDrop={(id) => {
          if (selectedId) handleDrop(id, selectedId);
        }}
      />
    </Wrap>
  );
}
