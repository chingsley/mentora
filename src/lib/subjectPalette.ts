import {
  SUBJECT_TILE_PALETTE,
  type SubjectTileTheme,
} from "@/constants/subjectPalette.constants";

/** Stable subject color from id — same subject always maps to the same palette slot. */
export function subjectThemeForId(subjectId: string): SubjectTileTheme {
  let hash = 0;
  for (let i = 0; i < subjectId.length; i += 1) {
    hash = (hash * 31 + subjectId.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % SUBJECT_TILE_PALETTE.length;
  return SUBJECT_TILE_PALETTE[idx]!;
}
