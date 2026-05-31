import type { OfferingRecurrence } from "@/lib/offeringRecurrence";
import {
  DEFAULT_OFFERING_RECURRENCE,
  offeringOccursOnDate,
} from "@/lib/offeringRecurrence";

export interface JoinParams {
  studentName: string;
  offeringId: string;
  offeringTitle: string;
}

/**
 * Client-side simulation hook for the join button. Real video provider
 * wiring (Daily.co / Agora / Twilio) should replace the body of this
 * function; the server-side counterpart in `src/server/classSession.ts`
 * handles attendance.
 */
export async function joinClassSession(params: JoinParams): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(
    `student ${params.studentName} joined class session (${params.offeringTitle} — offeringId=${params.offeringId})`,
  );
}

export interface LiveWindow {
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  startMinutes: number;
  endMinutes: number;
  recurrence?: OfferingRecurrence;
}

export function isClassLive(window: LiveWindow, now: Date = new Date()): boolean {
  const recurrence = window.recurrence ?? DEFAULT_OFFERING_RECURRENCE;
  if (!offeringOccursOnDate(recurrence, window.dayOfWeek, now)) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= window.startMinutes && minutes <= window.endMinutes;
}
