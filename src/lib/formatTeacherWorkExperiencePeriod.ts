const MONTH_YEAR: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", MONTH_YEAR);
}

/** e.g. `Sep 2018 — Jun 2022` or `Jan 2020 — Present` */
export function formatTeacherWorkExperiencePeriod(startDate: Date, endDate: Date | null): string {
  const from = formatMonthYear(startDate);
  const to = endDate ? formatMonthYear(endDate) : "Present";
  return `${from} — ${to}`;
}
