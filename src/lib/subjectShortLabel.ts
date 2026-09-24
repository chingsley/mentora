/** Canonical short labels for catalog subjects (matches `prisma/seed` names). */
const SUBJECT_SHORT_LABEL_BY_NAME: Readonly<Record<string, string>> = {
  mathematics: "Math",
  english: "Eng",
  physics: "Phys",
  chemistry: "Chem",
  programming: "Prog",
  music: "Music",
  biology: "Bio",
  history: "Hist",
  economics: "Econ",
  literature: "Lit",
};

function normalizeSubjectName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Compact subject label for chips and cards (e.g. English → Eng, Literature → Lit).
 */
export function formatSubjectShortLabel(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const mapped = SUBJECT_SHORT_LABEL_BY_NAME[normalizeSubjectName(trimmed)];
  if (mapped) return mapped;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase();
  }

  const word = words[0] ?? trimmed;
  if (word.length <= 4) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  if (word.length <= 5) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  return word.charAt(0).toUpperCase() + word.slice(1, 4).toLowerCase();
}
