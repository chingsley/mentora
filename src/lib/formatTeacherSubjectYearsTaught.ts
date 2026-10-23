/** Human-readable tenure for a subject on public teacher profiles (e.g. "1 year", "3 years"). */
export function formatTeacherSubjectYearsTaught(
  yearsTaught: number | string | null | undefined,
): string | null {
  const parsed =
    typeof yearsTaught === "string" ? Number.parseInt(yearsTaught, 10) : yearsTaught;
  if (parsed == null || !Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed === 1 ? "1 year" : `${parsed} years`;
}

/** Label for profile UI; uses an em dash when tenure is unknown. */
export function teacherSubjectTenureLabel(
  yearsTaught: number | string | null | undefined,
): string {
  return formatTeacherSubjectYearsTaught(yearsTaught) ?? "—";
}
