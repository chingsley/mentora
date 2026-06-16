import { COUNTRIES, getCountryByCode, getCountryByName } from "@/constants/countries.constants";
import { filterCitiesForCountry } from "@/lib/locationCities";

export interface TeacherLocationFields {
  countryCode: string;
  city: string;
}

export function formatTeacherLocationLabel(city: string, countryName: string): string {
  const cityTrimmed = city.trim();
  const countryTrimmed = countryName.trim();
  if (cityTrimmed && countryTrimmed) return `${cityTrimmed}, ${countryTrimmed}`;
  return cityTrimmed || countryTrimmed;
}

export function resolveTeacherLocationFields(profile: {
  locationCountryCode?: string | null;
  locationCity?: string | null;
  locationLabel?: string | null;
}): TeacherLocationFields {
  const storedCode = profile.locationCountryCode?.trim().toUpperCase() ?? "";
  const storedCity = profile.locationCity?.trim() ?? "";

  if (storedCode.length === 2) {
    return { countryCode: storedCode, city: storedCity };
  }

  return parseLegacyLocationLabel(profile.locationLabel ?? "");
}

export function parseLegacyLocationLabel(locationLabel: string): TeacherLocationFields {
  const trimmed = locationLabel.trim();
  if (!trimmed) return { countryCode: "", city: "" };

  const parts = trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const city = parts[0] ?? "";
    const countryPart = parts[parts.length - 1] ?? "";
    const country = getCountryByName(countryPart);
    if (country) return { countryCode: country.code, city };
  }

  const countryOnly = getCountryByName(trimmed);
  if (countryOnly) return { countryCode: countryOnly.code, city: "" };

  return { countryCode: "", city: trimmed };
}

export function getTeacherLocationCountryName(countryCode: string): string {
  return getCountryByCode(countryCode)?.name ?? "";
}

export function filterCountryOptions(query: string, limit = 12) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return COUNTRIES.slice(0, limit);
  return COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(normalized) ||
      country.code.toLowerCase().includes(normalized),
  ).slice(0, limit);
}

export function filterCityOptions(countryCode: string, query: string, limit = 12): string[] {
  return filterCitiesForCountry(countryCode, query, limit);
}
