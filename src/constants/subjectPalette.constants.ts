/** Per-subject calendar tile colors (stable hash by subject id). */
export interface SubjectTileTheme {
  bg: string;
  bgHover: string;
  border: string;
  text: string;
}

export const SUBJECT_TILE_PALETTE: readonly SubjectTileTheme[] = [
  { bg: "#e0e7ff", bgHover: "#c7d2fe", border: "#a5b4fc", text: "#312e81" },
  { bg: "#d1fae5", bgHover: "#a7f3d0", border: "#6ee7b7", text: "#064e3b" },
  { bg: "#fef3c7", bgHover: "#fde68a", border: "#fcd34d", text: "#78350f" },
  { bg: "#e0f2fe", bgHover: "#bae6fd", border: "#7dd3fc", text: "#0c4a6e" },
  { bg: "#ffe4e6", bgHover: "#fecdd3", border: "#fda4af", text: "#881337" },
  { bg: "#ede9fe", bgHover: "#ddd6fe", border: "#c4b5fd", text: "#4c1d95" },
  { bg: "#ccfbf1", bgHover: "#99f6e4", border: "#5eead4", text: "#134e4a" },
  { bg: "#ffedd5", bgHover: "#fed7aa", border: "#fdba74", text: "#7c2d12" },
] as const;
