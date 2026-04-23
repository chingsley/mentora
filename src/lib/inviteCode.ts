import { randomInt } from "node:crypto";

/**
 * Alphabet excludes ambiguous characters (0/O, 1/I/L) to keep codes easy to
 * type from an email.
 */
export const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const INVITE_CODE_LENGTH = 9;

export function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(0, INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

/** Formats a 9-char code as `XXX-XXX-XXX` for display. */
export function formatInviteCode(code: string): string {
  const cleaned = normalizeInviteCode(code);
  if (cleaned.length !== INVITE_CODE_LENGTH) return cleaned;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}`;
}

/** Strips dashes, spaces, and uppercases the input. */
export function normalizeInviteCode(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

export function isValidInviteCodeShape(raw: string): boolean {
  const cleaned = normalizeInviteCode(raw);
  if (cleaned.length !== INVITE_CODE_LENGTH) return false;
  for (const ch of cleaned) {
    if (!INVITE_CODE_ALPHABET.includes(ch)) return false;
  }
  return true;
}

/**
 * Generates a code, retrying on collision via the supplied existence checker.
 * Returns the first code not found in the store.
 */
export async function generateUniqueInviteCode(
  exists: (code: string) => Promise<boolean>,
  maxAttempts = 8,
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateInviteCode();
    if (!(await exists(code))) return code;
  }
  throw new Error("Could not generate a unique invite code after retries");
}
