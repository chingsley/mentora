"use client";

import * as React from "react";
import type { UpcomingClass } from "@/app/api/me/upcoming-classes/route";
import { joinClassSession } from "@/lib/classSession";
import { nextOccurrence, stageForOccurrence } from "@/lib/recurrence";
import { useToast } from "@/components/ui/Toast";

const FETCH_INTERVAL_MS = 2 * 60 * 1000;
const TICK_INTERVAL_MS = 30 * 1000;
const STORAGE_PREFIX = "reminder:";

export interface UseClassRemindersOptions {
  enabled: boolean;
  studentName: string;
}

export function useClassReminders({ enabled, studentName }: UseClassRemindersOptions) {
  const toast = useToast();
  const [classes, setClasses] = React.useState<UpcomingClass[]>([]);
  const toastRef = React.useRef(toast);
  const studentNameRef = React.useRef(studentName);

  React.useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  React.useEffect(() => {
    studentNameRef.current = studentName;
  }, [studentName]);

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    async function refetch() {
      try {
        const res = await fetch("/api/me/upcoming-classes", { cache: "no-store" });
        if (!res.ok) return;
        const payload = (await res.json()) as { classes: UpcomingClass[] };
        if (!cancelled) setClasses(payload.classes);
      } catch {
        /* ignore transient errors */
      }
    }
    refetch();
    const id = setInterval(refetch, FETCH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enabled]);

  React.useEffect(() => {
    if (!enabled) return;
    if (classes.length === 0) return;

    function tick() {
      const now = new Date();
      for (const c of classes) {
        const occurrence = nextOccurrence(c.dayOfWeek, c.startMinutes, now);
        const stage = stageForOccurrence(occurrence, now);
        if (!stage) continue;
        const scope = c.studentProfileId ?? "self";
        const key = `${STORAGE_PREFIX}${scope}:${c.offeringId}:${occurrence.toISOString()}:${stage}`;
        try {
          if (window.sessionStorage.getItem(key)) continue;
          window.sessionStorage.setItem(key, "1");
        } catch {
          /* sessionStorage unavailable */
        }
        fireReminder(c, stage, studentNameRef.current, toastRef.current.show);
      }
    }

    tick();
    const id = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, classes]);
}

function fireReminder(
  c: UpcomingClass,
  stage: "T-10" | "T-0",
  studentName: string,
  showToast: ReturnType<typeof useToast>["show"],
) {
  const isStart = stage === "T-0";
  const forWard = c.studentName ? `${c.studentName} · ` : "";
  const title = isStart
    ? `${forWard}${c.subject} starts now`
    : `${forWard}${c.subject} starts in 10 minutes`;
  const description = `${c.title} · ${formatTime(c.startMinutes)}`;

  showToast({
    title,
    description,
    tone: isStart ? "success" : "warning",
    durationMs: isStart ? 30_000 : 20_000,
    action: isStart
      ? {
          label: "Join class",
          onClick: () =>
            void joinClassSession({
              studentName,
              offeringId: c.offeringId,
              offeringTitle: c.title,
            }),
        }
      : undefined,
  });

  if (typeof window !== "undefined" && "Notification" in window) {
    if (window.Notification.permission === "granted") {
      try {
        new window.Notification(title, {
          body: description,
          tag: `${c.offeringId}:${stage}`,
        });
      } catch {
        /* browsers can throw in some contexts */
      }
    }
  }
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
