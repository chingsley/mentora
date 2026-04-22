"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { CalendarShell } from "@/components/features/calendar/CalendarShell";
import type { CalendarEntry } from "@/components/features/calendar/types";
import {
  ClassDetailsDialog,
  type ClassDetail,
} from "@/components/features/class/ClassDetailsDialog";
import type { Role } from "@prisma/client";
import { enrollAction } from "./actions";
import { dropAction } from "@/app/(app)/classes/actions";

export interface TeacherPublicCalendarProps {
  entries: CalendarEntry[];
  detailsByOfferingId: Record<string, ClassDetail>;
  enrollmentByOfferingId: Record<string, string>;
  viewerRole: Role;
  viewerName: string | null;
}

export function TeacherPublicCalendar({
  entries,
  detailsByOfferingId,
  enrollmentByOfferingId,
  viewerRole,
  viewerName,
}: TeacherPublicCalendarProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [message, setMessage] = React.useState<
    { tone: "success" | "error"; text: string } | null
  >(null);

  const detail = selectedId ? detailsByOfferingId[selectedId] ?? null : null;
  const enrollmentId = selectedId ? enrollmentByOfferingId[selectedId] ?? null : null;

  function onEntryClick(entry: CalendarEntry) {
    setSelectedId(entry.offeringId);
    setMessage(null);
  }

  function onClose() {
    setSelectedId(null);
    setMessage(null);
  }

  function handleEnrol(offeringId: string) {
    const fd = new FormData();
    fd.append("offeringId", offeringId);
    startTransition(async () => {
      const res = await enrollAction(fd);
      if (res.ok) {
        const success = res.results.filter((r) => r.enrolled).length > 0;
        if (success) {
          setMessage({
            tone: "success",
            text: "You're enrolled! This class now appears in your timetable.",
          });
          router.refresh();
        } else {
          const first = res.results.find((r) => !r.enrolled);
          setMessage({
            tone: "error",
            text: first?.reason ?? "Could not enroll in this class.",
          });
        }
      } else {
        setMessage({ tone: "error", text: res.error });
      }
    });
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

  return (
    <>
      <CalendarShell entries={entries} onEntryClick={onEntryClick} />
      <ClassDetailsDialog
        open={selectedId !== null}
        onClose={onClose}
        detail={detail}
        viewerRole={viewerRole}
        viewerName={viewerName}
        enrollmentId={enrollmentId}
        isBusy={isPending}
        message={message}
        onEnrol={handleEnrol}
        onDrop={handleDrop}
      />
    </>
  );
}
