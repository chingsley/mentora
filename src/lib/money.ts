/**
 * Money helpers: DB stores integer **smallest currency units** (e.g. cent, kobo).
 * UI and forms use **major** amounts (dollars, euros, naira).
 */

/** ISO 4217 currencies that have 0 decimal places. */
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "ISK",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

export function minorUnitExponent(currency: string): number {
  const c = currency.toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(c)) return 0;
  return 2;
}

export function majorToSmallest(major: number, currency: string): number {
  if (!Number.isFinite(major) || major < 0) {
    throw new RangeError("Amount must be a non-negative finite number");
  }
  const exp = minorUnitExponent(currency);
  return Math.round(major * 10 ** exp);
}

export function smallestToMajor(smallest: number, currency: string): number {
  if (!Number.isFinite(smallest) || smallest < 0) {
    throw new RangeError("Amount must be a non-negative finite number");
  }
  const exp = minorUnitExponent(currency);
  return smallest / 10 ** exp;
}

/** Parse a form/query string as major units → smallest, or undefined if empty/invalid. */
export function parseMajorToSmallest(
  raw: string | undefined,
  currency: string,
): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  const trimmed = String(raw).trim();
  if (trimmed === "") return undefined;
  const major = Number.parseFloat(trimmed);
  if (!Number.isFinite(major) || major < 0) return undefined;
  return majorToSmallest(major, currency);
}
