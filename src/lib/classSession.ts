export interface JoinParams {
  studentName: string;
  offeringId: string;
  offeringTitle: string;
}

/**
 * Placeholder for the virtual-classroom join action.
 * TODO: replace with the real video provider (Daily.co / Agora / Twilio).
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
}

const WEEKDAY_TO_ENUM = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

export function isClassLive(window: LiveWindow, now: Date = new Date()): boolean {
  const currentDay = WEEKDAY_TO_ENUM[now.getDay()];
  if (currentDay !== window.dayOfWeek) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= window.startMinutes && minutes <= window.endMinutes;
}
