/**
 * Split a single display name into `firstName` / `lastName` for `User` columns.
 * First token → firstName; remainder → lastName (may be empty for mononyms).
 */
export function splitFullName(name: string): { firstName: string; lastName: string } {
  const normalized = name.trim().replace(/\s+/g, " ");
  if (!normalized) return { firstName: "", lastName: "" };
  const space = normalized.indexOf(" ");
  if (space === -1) return { firstName: normalized, lastName: "" };
  return {
    firstName: normalized.slice(0, space),
    lastName: normalized.slice(space + 1).trim(),
  };
}
