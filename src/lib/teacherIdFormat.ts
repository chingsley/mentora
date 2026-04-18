const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PREFIX = "T";

/**
 * Regex for a valid teacher display id: T-YYMMDD-NN[A-Z].
 */
export const TEACHER_DISPLAY_ID_REGEX = /^T-\d{6}-\d{2}[A-Z]$/;

/**
 * Format a teacher display id for a given date + sequential index.
 * Index is 0-based. 0 -> 01A, 1 -> 01B, ..., 25 -> 01Z, 26 -> 02A, ...
 */
export function formatTeacherDisplayId(date: Date, index: number): string {
  if (index < 0 || !Number.isInteger(index)) {
    throw new Error(`index must be a non-negative integer: ${index}`);
  }
  const letter = ALPHABET[index % 26] ?? "A";
  const group = Math.floor(index / 26) + 1;
  return `${PREFIX}-${datePart(date)}-${String(group).padStart(2, "0")}${letter}`;
}

/** YYMMDD for the date in UTC. */
export function datePart(date: Date): string {
  const yy = String(date.getUTCFullYear() % 100).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

export const TEACHER_ID_PREFIX = PREFIX;
