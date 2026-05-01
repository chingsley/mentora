/**
 * Teacher profile dashboard subtitle under the page title.
 * Returns the full trimmed name when length ≤ 20; otherwise first word verbatim plus
 * the first letter of each remaining word (e.g. `John Snoweeeeeeeeeeeeeeeee` → `John S`).
 */
export function formatTeacherProfileSubtitleName(fullName: string): string {
  const trimmed = fullName.trim();
  if (trimmed.length === 0) return "";
  if (trimmed.length <= 20) return trimmed;

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return trimmed;
  if (parts.length === 1) {
    return parts[0]!.slice(0, 20);
  }

  const first = parts[0]!;
  const initials = parts
    .slice(1)
    .map((p) => (p[0] ? p[0].toUpperCase() : ""))
    .filter(Boolean)
    .join(" ");

  return initials ? `${first} ${initials}` : first;
}
