"use client";

import type { DayOfWeek } from "@prisma/client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { isClassLive } from "@/lib/classSession";
import type { OfferingRecurrence } from "@/lib/offeringRecurrence";
import { DEFAULT_OFFERING_RECURRENCE } from "@/lib/offeringRecurrence";
import { nextOccurrence } from "@/lib/recurrence";
import { minutesToTime } from "@/lib/time";

const LIVE_REFRESH_MS = 30_000;

export function formatJoinClassLabel(
  dayOfWeek: DayOfWeek,
  startMinutes: number,
  recurrence: OfferingRecurrence = DEFAULT_OFFERING_RECURRENCE,
  from: Date = new Date(),
): string {
  const at = nextOccurrence(dayOfWeek, startMinutes, from, recurrence);
  const dayShort = at.toLocaleDateString("en-US", { weekday: "short" });
  return `Join Class (${dayShort}, ${minutesToTime(startMinutes)})`;
}

export interface JoinClassButtonProps {
  offeringId: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  recurrence?: OfferingRecurrence;
}

export function JoinClassButton({
  offeringId,
  dayOfWeek,
  startMinutes,
  endMinutes,
  recurrence = DEFAULT_OFFERING_RECURRENCE,
}: JoinClassButtonProps) {
  const router = useRouter();
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const live = isClassLive({ dayOfWeek, startMinutes, endMinutes, recurrence });
  const joinLabel = formatJoinClassLabel(dayOfWeek, startMinutes, recurrence);

  if (live) {
    return (
      <Button type="button" onClick={() => router.push(`/classroom/${offeringId}`)}>
        Join live class
      </Button>
    );
  }

  return (
    <Button type="button" variant="secondary" disabled>
      {joinLabel}
    </Button>
  );
}
