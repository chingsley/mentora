import { formatPrice } from "@/lib/time";

export interface OfferingRateCurrencySource {
  user: { region: { currency: string } | null };
  rates: Array<{ region: { currency: string } }>;
}

export function teacherBillingCurrency(source: OfferingRateCurrencySource): string {
  return source.user.region?.currency ?? source.rates[0]?.region.currency ?? "USD";
}

export function offeringHourlyRateDisplay(
  hourlyRateMinor: number,
  currency: string,
): { amount: number; currency: string } {
  return { amount: hourlyRateMinor, currency };
}

export function minOfferingHourlyRate(offerings: Array<{ hourlyRate: number }>): number | null {
  if (offerings.length === 0) return null;
  return Math.min(...offerings.map((o) => o.hourlyRate));
}

export function formatStartingHourlyRate(minMinor: number, currency: string): string {
  return `from ${formatPrice(minMinor, currency)}`;
}

/** Label for billing cards when a subject spans multiple class rates. */
export function formatBillableRateLabel(
  minMinor: number,
  maxMinor: number,
  currency: string,
): string {
  if (minMinor === maxMinor) return formatPrice(minMinor, currency);
  return formatStartingHourlyRate(minMinor, currency);
}
