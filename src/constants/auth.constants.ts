/**
 * Auth full-bleed background layout (login / register).
 */
import { COLORS } from "./colors.constants";
import { FONTS } from "./fonts.constants";
import { MARKETING } from "./marketing.constants";
import { SPACING } from "./spacing.constants";

export const AUTH = {
  HERO_IMAGE_PATH: "/images/auth-hero.png",
  /** Anchor photo on the left where the teacher and student sit. */
  BACKGROUND_OBJECT_POSITION: "left center",
  /** Lighter on the left (subjects); darker on the right (form card). */
  SCENE_OVERLAY:
    "linear-gradient(90deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.28) 48%, rgba(15, 23, 42, 0.78) 100%)",
  CONTENT_MAX_WIDTH: MARKETING.MAX_WIDTH,
  CONTENT_PADDING: `clamp(${SPACING.FIVE}, 4vw, ${SPACING.TEN})`,
  CARD_MAX_WIDTH: "31.25rem",
  CARD_RADIUS: MARKETING.FEATURES_PANEL_RADIUS,
  CARD_PADDING: `clamp(${SPACING.SIX}, 4vw, ${SPACING.EIGHT})`,
  CARD_SHADOW: "0 12px 40px rgba(0, 0, 0, 0.22)",
  HERO_COPY_MAX_WIDTH: "28rem",
  HERO_TITLE_SIZE: FONTS.SIZE.AUTH_HERO_TITLE,
  HERO_TITLE_SIZE_LG: FONTS.SIZE.HERO,
  HERO_TITLE_COLOR: COLORS.WHITE,
  HERO_LEAD_COLOR: "rgba(255, 255, 255, 0.88)",
  HERO_LINK_COLOR: COLORS.WHITE,
} as const;
