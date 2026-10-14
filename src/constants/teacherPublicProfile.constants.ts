import { COLORS } from "./colors.constants";
import { LAYOUT } from "./layout.constants";
import { SPACING } from "./spacing.constants";

/** Public student-facing teacher profile (`/teachers/[id]`). */
export const TEACHER_PUBLIC_PROFILE = {
  CONTENT_MAX_WIDTH: "72rem",
  HERO_AVATAR_SIZE: "13.5rem",
  HERO_AVATAR_RADIUS: LAYOUT.RADIUS.XL,
  HERO_AVATAR_SHADOW: "0 12px 40px rgba(44, 44, 46, 0.12)",
  ABOUT_TRUNCATE_CHARS: 320,
} as const;

export const TEACHER_PUBLIC_PROFILE_SPACE = {
  HERO_GAP: SPACING.EIGHT,
  HERO_PADDING_BLOCK: SPACING.EIGHT,
  /** Hero band when nested under Teacher Profile tabs (less air below page title). */
  HERO_PADDING_BLOCK_PROFILE_PREVIEW: SPACING.FOUR,
  /** Pull hero chrome into `<Main>` top padding on `/profile` → Profile View. */
  PROFILE_PREVIEW_CHROME_PULL_BLOCK: LAYOUT.PAGE_INSET.BLOCK,
  /** Top inset for profile preview hero inside grey chrome. */
  PROFILE_PREVIEW_TITLE_PADDING_BLOCK: LAYOUT.PAGE_INSET.BLOCK,
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
