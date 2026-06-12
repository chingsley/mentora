/**
 * Marketing / public-site layout tokens (homepage, landing sections).
 */
import { COLORS } from "./colors.constants";
import { ICON_SIZE } from "./iconTheme.constants";
import { LAYOUT } from "./layout.constants";
import { SPACING } from "./spacing.constants";

export const MARKETING = {
  /** Max content width for hero, header, and footer. */
  MAX_WIDTH: "72rem",
  /** Sticky public header height. */
  HEADER_HEIGHT: "3.25rem",
  HEADER_SURFACE: COLORS.MARKETING_HEADER_SURFACE,
  HEADER_BORDER: COLORS.MARKETING_BORDER,
  /** Primary CTA geometry — very subtle corners (ref. jitsi.org). */
  CTA_RADIUS: LAYOUT.RADIUS.XS,
  /** Shared min-height for marketing primary/secondary CTAs (44px). */
  CTA_MIN_HEIGHT: "2.75rem",
  CTA_PRIMARY_BG: COLORS.ACTION_PRIMARY,
  CTA_PRIMARY_BG_HOVER: COLORS.ACTION_PRIMARY_HOVER,
  CTA_PRIMARY_TEXT: COLORS.WHITE,
  CTA_SECONDARY_BG: COLORS.MARKETING_SURFACE_SECONDARY,
  CTA_SECONDARY_BG_HOVER: COLORS.MUTED,
  CTA_SECONDARY_TEXT: COLORS.MARKETING_TEXT_PRIMARY,
  /** Hero vertical padding: 64px → 96px. */
  HERO_PADDING_BLOCK: `clamp(${SPACING.TEN}, 8vw, ${SPACING.TWELVE})`,
  HERO_PADDING_INLINE: `clamp(${SPACING.FOUR}, 4vw, ${SPACING.EIGHT})`,
  HERO_GRID_GAP: `clamp(${SPACING.EIGHT}, 6vw, ${SPACING.TWELVE})`,
  /** Hero copy column — two-thirds of the hero content area. */
  HERO_STACK_WIDTH: "66.666667%",
  /** Space between hero copy block and features panel. */
  FEATURES_SECTION_OFFSET: SPACING.TWELVE,
  /** Full-width features panel on the homepage. */
  FEATURES_PANEL_RADIUS: LAYOUT.RADIUS.SM,
  FEATURES_PANEL_PADDING: `clamp(${SPACING.SIX}, 4vw, ${SPACING.EIGHT})`,
  FEATURES_GRID_GAP: `clamp(${SPACING.FIVE}, 3vw, ${SPACING.EIGHT})`,
  /** Homepage feature list icon chrome. */
  FEATURE_ICON_BOX_SIZE: "1.75rem",
  FEATURE_ICON_BOX_RADIUS: LAYOUT.RADIUS.MD,
  FEATURE_ICON_GLYPH_SIZE: ICON_SIZE.LG,
} as const;
