/**
 * ISO 4217 billing currencies teachers may select when setting hourly rates.
 * Platform regions may only cover a subset; rates require a matching region on save.
 */
export const BILLING_CURRENCY_CODES = [
  "AED",
  "ARS",
  "AUD",
  "BDT",
  "BGN",
  "BRL",
  "CAD",
  "CHF",
  "CLP",
  "CNY",
  "COP",
  "CZK",
  "DKK",
  "EGP",
  "EUR",
  "GBP",
  "GHS",
  "HKD",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "JPY",
  "KES",
  "KRW",
  "MXN",
  "MYR",
  "NGN",
  "NOK",
  "NZD",
  "PHP",
  "PKR",
  "PLN",
  "RON",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "TWD",
  "USD",
  "VND",
  "ZAR",
] as const;

export type BillingCurrencyCode = (typeof BILLING_CURRENCY_CODES)[number];

export const BILLING_CURRENCY_OPTIONS: ReadonlyArray<{ value: BillingCurrencyCode; label: string }> =
  BILLING_CURRENCY_CODES.map((code) => ({
    value: code,
    label: code,
  }));

export function isBillingCurrencyCode(value: string): value is BillingCurrencyCode {
  return (BILLING_CURRENCY_CODES as readonly string[]).includes(value);
}
