"use client";

import type { DayOfWeek } from "@prisma/client";
import { useParams } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { isClassLive } from "@/lib/classSession";
import { DAY_LABEL, minutesToTime } from "@/lib/time";
import { joinAsObserverAction } from "./actions";

export interface GuardianJoinObserverButtonProps {
  enrollmentId: string;
  offeringTitle: string;
  studentName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
}

export function GuardianJoinObserverButton({
  enrollmentId,
  dayOfWeek,
  startMinutes,
  endMinutes,
}: GuardianJoinObserverButtonProps) {
  const params = useParams<{ studentId: string }>();
  const studentProfileId = params?.studentId ?? "";
  const [, setTick] = React.useState(0);
  const [joining, setJoining] = React.useState(false);
  const [message, setMessage] = React.useState<{ tone: "ok" | "error"; text: string } | null>(
    null,
  );

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), 30_000);
    return () => clearInterval(id);
  }, []);

  const live = isClassLive({ dayOfWeek, startMinutes, endMinutes });

  async function handleJoin() {
    setJoining(true);
    setMessage(null);
    try {
      const res = await joinAsObserverAction({
        studentProfileId,
        enrollmentId,
      });
      if (res.ok) {
        setMessage({
          tone: "ok",
          text: "Joined as observer. The video screen will open here when enabled.",
        });
      } else {
        setMessage({ tone: "error", text: res.error ?? "Could not join" });
      }
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {live ? (
        <Button
          type="button"
          variant="secondary"
          onClick={handleJoin}
          isLoading={joining}
        >
          Join as observer
        </Button>
      ) : (
        <Button type="button" variant="secondary" disabled>
          Next session {DAY_LABEL[dayOfWeek]} · {minutesToTime(startMinutes)}
        </Button>
      )}
      {message ? (
        <p
          className={`text-[11px] ${
            message.tone === "ok" ? "text-success" : "text-destructive"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
