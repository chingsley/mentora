export type Meridiem = "AM" | "PM";

export interface Time12Parts {
  timeText: string;
  meridiem: Meridiem;
}

export function parseTime24(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const hours = Number.parseInt(match[1]!, 10);
  const minutes = Number.parseInt(match[2]!, 10);
  if (hours > 23 || minutes > 59) return null;

  return { hours, minutes };
}

export function formatTime24(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function time24To12Parts(value: string): Time12Parts {
  const parsed = parseTime24(value);
  if (!parsed) {
    return { timeText: "", meridiem: "AM" };
  }

  const meridiem: Meridiem = parsed.hours >= 12 ? "PM" : "AM";
  let hours12 = parsed.hours % 12;
  if (hours12 === 0) hours12 = 12;

  return {
    timeText: `${hours12}:${String(parsed.minutes).padStart(2, "0")}`,
    meridiem,
  };
}

export function parseTime12Text(text: string): { hours12: number; minutes: number } | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const match = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(trimmed);
  if (!match) return null;

  const hours12 = Number.parseInt(match[1]!, 10);
  const minutes = match[2] != null ? Number.parseInt(match[2], 10) : 0;
  if (hours12 < 1 || hours12 > 12 || minutes < 0 || minutes > 59) return null;

  return { hours12, minutes };
}

export function time12PartsTo24(timeText: string, meridiem: Meridiem): string | null {
  const parsed = parseTime12Text(timeText);
  if (!parsed) return null;

  let hours = parsed.hours12;
  if (meridiem === "AM") {
    if (hours === 12) hours = 0;
  } else if (hours !== 12) {
    hours += 12;
  }

  return formatTime24(hours, parsed.minutes);
}

export function sanitizeTime12Input(raw: string): string {
  const cleaned = raw.replace(/[^\d:]/g, "");
  const colonIndex = cleaned.indexOf(":");
  if (colonIndex === -1) return cleaned.slice(0, 2);

  const hours = cleaned.slice(0, colonIndex).slice(0, 2);
  const minutes = cleaned.slice(colonIndex + 1).replace(/:/g, "").slice(0, 2);
  return minutes.length > 0 ? `${hours}:${minutes}` : `${hours}:`;
}

export function normalizeTime12Text(text: string): string {
  const parsed = parseTime12Text(text);
  if (!parsed) return text.trim();

  return `${parsed.hours12}:${String(parsed.minutes).padStart(2, "0")}`;
}
