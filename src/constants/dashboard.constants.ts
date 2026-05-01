/**
 * Teacher dashboard UI tokens (reference: dashboard layout cards, stats, charts).
 * Compose with `COLORS`, `LAYOUT`, and `SPACING` from sibling constants.
 */
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";

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
  LINK: "#2563eb",
  LINK_HOVER: "#1d4ed8",
  ROW_HOVER: "#f8fafc",
  TABLE_HEADER: "#64748b",

  PRIMARY_BLUE: "#3b82f6",
  SUCCESS: "#22c55e",
  SUCCESS_BG: "rgba(34, 197, 94, 0.12)",
  WARNING_ORANGE: "#f97316",
  PURPLE_ACCENT: "#a855f7",
  SIDEBAR_PROMO_BG: "#0f766e",
  SIDEBAR_PROMO_CTA: "#14b8a6",

  BADGE_ACTIVE_BG: "#dcfce7",
  BADGE_ACTIVE_TEXT: "#166534",

  CHART_LINE: "#3b82f6",
  CHART_FILL_START: "rgba(59, 130, 246, 0.35)",
  CHART_FILL_END: "rgba(59, 130, 246, 0.02)",
  CHART_GRID: "#e2e8f0",

  /**
   * Matches Maje `TeacherDashboardMetricCard` default (light) shell:
   * `shadow-[0_4px_24px_rgba(19,30,53,0.06)]`
   */
  CARD_SHADOW: "0 4px 24px rgba(19, 30, 53, 0.06)",
  CARD_RADIUS: LAYOUT.RADIUS.LG,
  SEARCH_RADIUS: LAYOUT.RADIUS.LG,
  HEADER_HEIGHT: "4rem",
  STAT_GRID_MIN: "15rem",
  TOP_GRID_MAIN: "minmax(0, 1fr)",
  TOP_GRID_SIDE: "minmax(17rem, 22rem)",
} as const;
