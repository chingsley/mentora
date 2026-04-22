"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { CalendarShell } from "@/components/features/calendar/CalendarShell";
import {
  ClassDetailsDialog,
  type ClassDetail,
} from "@/components/features/class/ClassDetailsDialog";
import type { CalendarEntry } from "@/components/features/calendar/types";
import { DAY_LABEL, minutesToTime } from "@/lib/time";
import { JoinClassButton } from "@/components/features/student/JoinClassButton";
import { dropAction } from "./actions";

type Tab = "timetable" | "list";

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

export function StudentClassesClient({ rows, viewerName }: StudentClassesClientProps) {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("timetable");
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
      <div className="rounded-xl bg-foreground p-8 text-center ring-1 ring-black/5">
        <h3 className="text-base font-semibold text-header">No active classes</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Find a teacher and pick the periods that work for you.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Class view"
        className="inline-flex self-start rounded-md border border-border bg-foreground p-0.5"
      >
        <TabButton current={tab} value="timetable" onSelect={setTab}>
          Timetable
        </TabButton>
        <TabButton current={tab} value="list" onSelect={setTab}>
          List
        </TabButton>
      </div>

      {tab === "timetable" ? (
        <CalendarShell
          entries={entries}
          onEntryClick={(e) => {
            setSelectedId(e.offeringId);
            setMessage(null);
          }}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li
              key={r.enrollmentId}
              className="flex flex-col gap-3 rounded-xl bg-foreground p-4 ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-header">{r.entry.title}</p>
                <p className="text-sm text-muted-foreground">
                  {r.detail.subjectName} · with {r.teacherName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {DAY_LABEL[r.entry.dayOfWeek]} · {minutesToTime(r.entry.startMinutes)}–
                  {minutesToTime(r.entry.endMinutes)} · {r.detail.enrolled}/
                  {r.detail.effectiveCap} enrolled
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
                <Button
                  type="button"
                  variant="destructive"
                  isLoading={isPending}
                  onClick={() => handleDrop(r.enrollmentId)}
                >
                  Drop
                </Button>
              </div>
            </li>
          ))}
        </ul>
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
    </div>
  );
}

function TabButton({
  current,
  value,
  onSelect,
  children,
}: {
  current: Tab;
  value: Tab;
  onSelect: (v: Tab) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(value)}
      className={`h-8 rounded-sm px-3 text-xs font-medium transition-colors ${
        active ? "bg-header text-white" : "text-header hover:bg-header/[0.06]"
      }`}
    >
      {children}
    </button>
  );
}
