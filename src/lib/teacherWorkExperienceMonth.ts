/** `YYYY-MM` for `<input type="month" />`. */
export function monthInputFromDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function dateFromMonthInput(value: string): Date {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) throw new Error("Invalid month");
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) throw new Error("Invalid month");
  return new Date(Date.UTC(year, month - 1, 1));
}
