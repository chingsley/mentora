"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { CalendarShell } from "@/components/features/calendar/CalendarShell";
import {
  ClassDetailsDialog,
  type ClassDetail,
} from "@/components/features/class/ClassDetailsDialog";
import type { CalendarEntry } from "@/components/features/calendar/types";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { DAY_LABEL, minutesToTime } from "@/lib/time";
import { JoinClassButton } from "@/components/features/student/JoinClassButton";
import { dropAction } from "./actions";

type TabKey = "timetable" | "list";

export interface StudentClassRow {
  enrollmentId: string;
  entry: CalendarEntry;
  detail: ClassDetail;
  teacherName: string;
}

export interface StudentClassesClientProps {
  rows: StudentClassRow[];
  viewerName: string | null;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const TabList = styled.div`
  display: inline-flex;
  align-self: flex-start;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0.125rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  height: 2rem;
  border-radius: ${LAYOUT.RADIUS.SM};
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  border: none;
  background-color: transparent;
  color: ${COLORS.HEADER};
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  ${(p) =>
    p.$active
      ? css`
          background-color: ${COLORS.HEADER};
          color: ${COLORS.WHITE};
        `
      : css`
          &:hover {
            background-color: rgba(23, 32, 51, 0.06);
          }
        `}
`;

const Empty = styled.div`
  border-radius: ${LAYOUT.RADIUS.XL};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.EIGHT};
  text-align: center;
  outline: 1px solid ${COLORS.RING_BLACK_5};
  outline-offset: -1px;
`;

const EmptyTitle = styled.h3`
  font-size: ${FONTS.SIZE.BASE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const EmptyBody = styled.p`
  margin-top: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ListUl = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.XL};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.FOUR};
  outline: 1px solid ${COLORS.RING_BLACK_5};
  outline-offset: -1px;

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const ItemTitle = styled.p`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const ItemMeta = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ItemActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const SecondaryLink = styled(Link)`
  display: inline-flex;
  height: 2.5rem;
  align-items: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    background-color: rgba(23, 32, 51, 0.06);
  }
`;

export function StudentClassesClient({ rows, viewerName }: StudentClassesClientProps) {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabKey>("timetable");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
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

  const detail = selectedId ? detailsByOfferingId[selectedId] ?? null : null;
  const enrollmentId = selectedId ? enrollmentByOfferingId[selectedId] ?? null : null;

  function onClose() {
    setSelectedId(null);
    setMessage(null);
  }

  function handleDrop(id: string) {
    const fd = new FormData();
    fd.append("enrollmentId", id);
    startTransition(async () => {
      await dropAction(fd);
      setMessage({
        tone: "success",
        text: "You've been removed from this class.",
      });
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyTitle>No active classes</EmptyTitle>
        <EmptyBody>Find a teacher and pick the periods that work for you.</EmptyBody>
      </Empty>
    );
  }

  return (
    <Wrap>
      <TabList role="tablist" aria-label="Class view">
        <Tab type="button" role="tab" aria-selected={tab === "timetable"} $active={tab === "timetable"} onClick={() => setTab("timetable")}>
          Timetable
        </Tab>
        <Tab type="button" role="tab" aria-selected={tab === "list"} $active={tab === "list"} onClick={() => setTab("list")}>
          List
        </Tab>
      </TabList>

      {tab === "timetable" ? (
        <CalendarShell
          entries={entries}
          onEntryClick={(e) => {
            setSelectedId(e.offeringId);
            setMessage(null);
          }}
        />
      ) : (
        <ListUl>
          {rows.map((r) => (
            <ListItem key={r.enrollmentId}>
              <div>
                <ItemTitle>{r.entry.title}</ItemTitle>
                <ItemMeta>
                  {r.detail.subjectName} · with {r.teacherName}
                </ItemMeta>
                <ItemMeta>
                  {DAY_LABEL[r.entry.dayOfWeek]} · {minutesToTime(r.entry.startMinutes)}–
                  {minutesToTime(r.entry.endMinutes)} · {r.detail.enrolled}/
                  {r.detail.effectiveCap} enrolled
                </ItemMeta>
              </div>
              <ItemActions>
                <JoinClassButton
                  offeringId={r.entry.offeringId}
                  offeringTitle={r.entry.title}
                  studentName={viewerName ?? "Student"}
                  dayOfWeek={r.entry.dayOfWeek}
                  startMinutes={r.entry.startMinutes}
                  endMinutes={r.entry.endMinutes}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedId(r.entry.offeringId);
                    setMessage(null);
                  }}
                >
                  View details
                </Button>
                <SecondaryLink href={`/classes/${r.entry.offeringId}/assignments`}>
                  Assignments
                </SecondaryLink>
                <Button
                  type="button"
                  variant="destructive"
                  isLoading={isPending}
                  onClick={() => handleDrop(r.enrollmentId)}
                >
                  Drop
                </Button>
              </ItemActions>
            </ListItem>
          ))}
        </ListUl>
      )}

      <ClassDetailsDialog
        open={selectedId !== null}
        onClose={onClose}
        detail={detail}
        viewerRole="STUDENT"
        viewerName={viewerName}
        enrollmentId={enrollmentId}
        isBusy={isPending}
        message={message}
        onDrop={handleDrop}
      />
    </Wrap>
  );
}
