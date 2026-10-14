/** ISO 3166-1 alpha-2 country code → flag emoji (empty when unknown). */
export function countryCodeToFlagEmoji(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  const offset = 0x1f1e6;
  const chars = [...code].map((char) => String.fromCodePoint(offset + char.charCodeAt(0) - 65));
  return chars.join("");
}
