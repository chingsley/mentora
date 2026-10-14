/** Comma-separated language list from teacher profile → display names. */
export function parseSpokenLanguages(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}
