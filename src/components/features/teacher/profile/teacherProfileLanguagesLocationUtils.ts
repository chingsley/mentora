import type { SearchComboboxOption } from "@/components/ui/SearchCombobox";
import { getCountryByCode } from "@/constants/countries.constants";
import { getCitiesForCountry } from "@/lib/locationCities";

export function parseLanguageTags(raw: string): string[] {
  return raw
    .split(/[,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function initialCountryOption(countryCode: string): SearchComboboxOption | null {
  if (!countryCode) return null;
  const country = getCountryByCode(countryCode);
  return country ? { value: country.code, label: country.name } : null;
}

export function initialCityOption(city: string): SearchComboboxOption | null {
  const trimmed = city.trim();
  return trimmed ? { value: trimmed, label: trimmed } : null;
}

export function cityOptionsForCountry(countryCode: string): SearchComboboxOption[] {
  return getCitiesForCountry(countryCode).map((city) => ({
    value: city,
    label: city,
  }));
}
