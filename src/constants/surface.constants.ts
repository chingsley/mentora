/**
 * Shared surface chrome — aligned with teacher dashboard cards.
 */
import { COLORS } from "./colors.constants";
import { BOX_SHADOW_CARD, LAYOUT } from "./layout.constants";

export const SURFACE = {
  RADIUS: LAYOUT.RADIUS.SM,
  BACKGROUND: COLORS.FOREGROUND,
  BORDER: COLORS.MARKETING_BORDER,
  SHADOW: BOX_SHADOW_CARD,
} as const;
