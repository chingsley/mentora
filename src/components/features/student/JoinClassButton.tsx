"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { isClassLive, joinClassSession } from "@/lib/classSession";
import { DAY_LABEL, minutesToTime } from "@/lib/time";

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

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), 30_000);
    return () => clearInterval(id);
  }, []);

  const live = isClassLive({ dayOfWeek, startMinutes, endMinutes });

  async function handleJoin() {
    setJoining(true);
    try {
      await joinClassSession({ offeringId, offeringTitle, studentName });
    } finally {
      setJoining(false);
    }
  }

  if (live) {
    return (
      <Button type="button" onClick={handleJoin} isLoading={joining}>
        Join class session
      </Button>
    );
  }

  return (
    <Button type="button" variant="secondary" disabled>
      Opens {DAY_LABEL[dayOfWeek]} at {minutesToTime(startMinutes)}
    </Button>
  );
}
