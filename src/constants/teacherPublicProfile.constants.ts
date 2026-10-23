import { COLORS } from "./colors.constants";
import { ICON_SIZE } from "./iconTheme.constants";
import { LAYOUT } from "./layout.constants";
import { SPACING } from "./spacing.constants";

/** Public student-facing teacher profile (`/teachers/[id]`). */
export const TEACHER_PUBLIC_PROFILE = {
  CONTENT_MAX_WIDTH: "72rem",
  HERO_AVATAR_SIZE: "13.5rem",
  HERO_AVATAR_RADIUS: LAYOUT.RADIUS.XL,
  HERO_AVATAR_SHADOW: "0 12px 40px rgba(44, 44, 46, 0.12)",
  ABOUT_TRUNCATE_CHARS: 320,
  /** Hero summary edit rows: icon | label | control grid. */
  HERO_INLINE_ICON_COLUMN: `${ICON_SIZE.SM}px`,
  /** Fits “Based in:” so Headline / Speaks / Based in controls share a left edge. */
  HERO_INLINE_LABEL_WIDTH: "4.75rem",
} as const;

export const TEACHER_PUBLIC_PROFILE_SPACE = {
  HERO_GAP: SPACING.EIGHT,
  HERO_PADDING_BLOCK: SPACING.EIGHT,
  BODY_PADDING_BLOCK: SPACING.TEN,
  BADGE_GAP: SPACING.FOUR,
  CONTENT_COLUMNS_GAP: SPACING.TEN,
} as const;

/** Hero band behind profile header (mockup grey wash). */
export const TEACHER_PUBLIC_PROFILE_HERO_SURFACE = COLORS.SURFACE_OFF_WHITE;

/** “Native” language chip on public teacher header. */
export const TEACHER_PUBLIC_PROFILE_NATIVE_BADGE = {
  BACKGROUND: COLORS.STATUS_PRESENT_BG,
  TEXT: COLORS.STATUS_PRESENT_TEXT,
} as const;
