"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { isClassLive, joinClassSession } from "@/lib/classSession";
import { DAY_LABEL, minutesToTime } from "@/lib/time";
import { joinAsStudentAction } from "@/app/(app)/actions/joinClass";

export interface JoinClassButtonProps {
  offeringId: string;
  offeringTitle: string;
  studentName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
}

export function JoinClassButton({
  offeringId,
  offeringTitle,
  studentName,
  dayOfWeek,
  startMinutes,
  endMinutes,
}: JoinClassButtonProps) {
  const [, setTick] = React.useState(0);
  const [joining, setJoining] = React.useState(false);
  const [joined, setJoined] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), 30_000);
    return () => clearInterval(id);
  }, []);

  const live = isClassLive({ dayOfWeek, startMinutes, endMinutes });

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      await joinClassSession({ offeringId, offeringTitle, studentName });
      const res = await joinAsStudentAction({ offeringId });
      if (!res.ok) {
        setError(res.error ?? "Could not join");
      } else {
        setJoined(true);
      }
    } finally {
      setJoining(false);
    }
  }

  if (live) {
    return (
      <div className="flex flex-col gap-1">
        <Button type="button" onClick={handleJoin} isLoading={joining} disabled={joined}>
          {joined ? "Joined" : "Join class session"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <Button type="button" variant="secondary" disabled>
      Opens {DAY_LABEL[dayOfWeek]} at {minutesToTime(startMinutes)}
    </Button>
  );
}
