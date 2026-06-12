/**
 * Status / label chips — matches dashboard card radius and teal accent system.
 */
import { COLORS } from "./colors.constants";
import { FONTS } from "./fonts.constants";
import { LAYOUT } from "./layout.constants";
import { SPACING } from "./spacing.constants";

export type ChipTone = "active" | "neutral" | "success" | "warning" | "danger" | "info";

export const CHIP = {
  /** Same corner radius as dashboard cards and inputs. */
  RADIUS: LAYOUT.RADIUS.SM,
  FONT_SIZE: FONTS.SIZE["2XS"],
  FONT_WEIGHT: FONTS.WEIGHT.SEMIBOLD,
  PADDING_BLOCK: SPACING.HALF,
  PADDING_INLINE: SPACING.TWO,
} as const;

export const CHIP_TONE: Record<ChipTone, { background: string; color: string; border: string }> = {
  active: {
    background: COLORS.ACTION_PRIMARY_TINT_16,
    color: COLORS.ACTION_PRIMARY,
    border: COLORS.ACTION_PRIMARY_BORDER_25,
  },
  neutral: {
    background: COLORS.SURFACE_OFF_WHITE,
    color: COLORS.GRAY_TEXT_SECONDARY,
    border: COLORS.MARKETING_BORDER,
  },
  success: {
    background: COLORS.STATUS_PRESENT_BG,
    color: COLORS.STATUS_PRESENT_TEXT,
    border: "rgba(22, 163, 74, 0.28)",
  },
  warning: {
    background: COLORS.STATUS_LATE_BG,
    color: COLORS.STATUS_LATE_TEXT,
    border: "rgba(217, 119, 6, 0.28)",
  },
  danger: {
    background: COLORS.STATUS_ABSENT_BG,
    color: COLORS.STATUS_ABSENT_TEXT,
    border: "rgba(220, 38, 38, 0.28)",
  },
  info: {
    background: COLORS.ACTION_PRIMARY_TINT_10,
    color: COLORS.ACTION_PRIMARY,
    border: COLORS.ACTION_PRIMARY_BORDER_22,
  },
} as const;
