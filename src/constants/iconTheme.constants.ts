import { COLORS } from "@/constants/colors.constants";
import { LAYOUT } from "@/constants/layout.constants";

/** Maje `teacher-dashboard-marketing.css` `--brand` / `--brand-strong` */
const MAJE_BRAND = COLORS.SIDEBAR_BRAND;
const MAJE_BRAND_STRONG = "#495679";
/** Maje teacher KPI second icon box `bg-[#8b9bb4]` (`teacher-dashboard-view.tsx`) */
const MAJE_ICON_BOX_MUTED = "#8b9bb4";

/** Shared wash behind secondary icon boxes and action-style icon links */
const BRAND_WASH_8 = "rgba(95, 111, 149, 0.08)";

/** 1px brand outline on every secondary (wash) icon tile and matching controls */
const ICON_SECONDARY_BORDER = `1px solid ${MAJE_BRAND}` as const;

/**
 * Canonical icon chrome when the product asks for a **primary** vs **secondary** icon box.
 * - **PRIMARY**: filled brand background, white glyph.
 * - **SECONDARY**: light brand wash, brand-colored glyph, `ICON_SECONDARY_BORDER`.
 */
export const ICON_BOX_TYPE = {
  PRIMARY: {
    background: MAJE_BRAND,
    color: COLORS.WHITE,
    border: "none",
  },
  SECONDARY: {
    background: BRAND_WASH_8,
    color: MAJE_BRAND,
    border: ICON_SECONDARY_BORDER,
  },
} as const;

export type IconBoxTypeKey = keyof typeof ICON_BOX_TYPE;

/**
 * Maje `TeacherDashboardMetricCard` (see Maje `teacher-dashboard-metric-card.tsx`):
 * - Wrapper: `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base leading-none`
 * - `iconBoxClassName` examples from `teacher-dashboard-view.tsx`:
 *   - `bg-[color:var(--brand)] text-white shadow-sm`
 *   - `bg-[#8b9bb4] text-white shadow-sm`
 *   - `bg-[color:var(--brand-strong)] text-white shadow-sm`
 * Tune the hex sources above (or this object) for app-wide teacher-dashboard icon chrome.
 */
export const ICON_THEME = {
  MAJE_BRAND,
  MAJE_BRAND_STRONG,
  MAJE_ICON_BOX_MUTED,

  GLYPH_ON_FILLED_BOX: "#ffffff",

  METRIC_ICON_BOX_SHADOW: LAYOUT.SHADOW.SM,
  METRIC_ICON_BOX_SIZE: "2.5rem",
  METRIC_ICON_BOX_RADIUS: LAYOUT.RADIUS.LG,
  METRIC_LUCIDE_SIZE: 20,

  /**
   * Clickable icon controls (e.g. session “open schedule”) — wash + brand glyph, no filled
   * metric tile / shadow so they read as actions, not static KPI chrome.
   */
  ACTION_LINK_SIZE: "2.25rem",
  ACTION_LINK_BACKGROUND: BRAND_WASH_8,
  ACTION_LINK_BACKGROUND_HOVER: "rgba(95, 111, 149, 0.16)",
  ACTION_LINK_BORDER: ICON_SECONDARY_BORDER,
  ACTION_LINK_FOREGROUND: MAJE_BRAND,
  ACTION_LINK_LUCIDE_SIZE: 18,

  AVATAR_PLACEHOLDER_BACKGROUND: MAJE_ICON_BOX_MUTED,
  AVATAR_PLACEHOLDER_GLYPH: "#ffffff",

  INLINE_MUTED: "#64748b",
  INLINE_SUBTLE: "#94a3b8",

  FOCUS_RING_NEUTRAL: "rgba(95, 111, 149, 0.45)",
} as const;
