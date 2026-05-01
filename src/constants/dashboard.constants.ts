/**
 * Teacher dashboard UI tokens (reference: dashboard layout cards, stats, tables, sessions).
 * Compose with `COLORS`, `LAYOUT`, and `SPACING` from sibling constants.
 */
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { BOX_SHADOW_CARD, LAYOUT } from "@/constants/layout.constants";

export const DASHBOARD = {
  PAGE_BACKGROUND: "#f8f9fb",
  CARD_BACKGROUND: "#ffffff",
  /** Shell border for `DashboardCard` and stat tiles */
  CARD_BORDER: "#e1e7ef",
  BORDER_SUBTLE: "#e8ecf1",
  TEXT_PRIMARY: "#0f172a",
  TEXT_SECONDARY: "#64748b",
  TEXT_MUTED: "#94a3b8",

  /**
   * Dashboard secondary text: supporting copy (stat hints, table meta, session sublines,
   * empty states, profile role, search field text and placeholder). 0.875rem + `COLORS.SIDEBAR_MUTED`.
   */
  SECONDARY_TEXT: {
    FONT_SIZE: FONTS.SIZE.SM,
    COLOR: COLORS.SIDEBAR_MUTED,
  },
  ROW_HOVER: "#f8fafc",
  TABLE_HEADER: "#64748b",

  SUCCESS: "#22c55e",

  BADGE_ACTIVE_BG: "#dcfce7",
  BADGE_ACTIVE_TEXT: "#166534",

  /**
   * Matches Maje `TeacherDashboardMetricCard` default (light) shell:
   * `shadow-[0_4px_24px_rgba(19,30,53,0.06)]`
   */
  CARD_SHADOW: BOX_SHADOW_CARD,
  CARD_RADIUS: LAYOUT.RADIUS.LG,
  SEARCH_RADIUS: LAYOUT.RADIUS.LG,
  /**
   * Shell search (`TeacherDashboardHeader`): prior cap was `36rem`; reduced by 30% (`× 0.7`).
   */
  SEARCH_FIELD_MAX_WIDTH: "calc(36rem * 0.7)",
} as const;
