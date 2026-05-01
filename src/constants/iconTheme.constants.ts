import { COLORS } from "@/constants/colors.constants";
import { LAYOUT } from "@/constants/layout.constants";

/** Maje `teacher-dashboard-marketing.css` `--brand` / `--brand-strong` */
const MAJE_BRAND = COLORS.SIDEBAR_BRAND;
const MAJE_BRAND_STRONG = "#495679";
/** Maje teacher KPI second icon box `bg-[#8b9bb4]` (`teacher-dashboard-view.tsx`) */
const MAJE_ICON_BOX_MUTED = "#8b9bb4";

/** Shared wash behind secondary icon boxes and action-style icon links */
const BRAND_WASH_8 = "rgba(95, 111, 149, 0.08)";
// const BRAND_WASH_8 = "#f1f1f1";

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
  },
  SECONDARY: {
    background: BRAND_WASH_8,
    color: MAJE_BRAND,
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
/**
 * Lucide glyph sizes (in px) and stroke widths used app-wide.
 * Always pass these to `<LucideIcon size={...} strokeWidth={...} />`
 * instead of hardcoded numbers, so we can retune all icon density in
 * one place.
 */
export const ICON_SIZE = {
  /** 13px — inline badges (e.g. profile rating chip). */
  XS: 13,
  /** 16px — inline meta icons (chevrons, briefcase, languages). */
  SM: 16,
  /** 18px — toolbar icons, action buttons, info pills, top header. */
  MD: 18,
  /** 20px — sidebar nav, KPI tile glyphs, alerts. */
  LG: 20,
  /** 24px — large emphasis (e.g. mobile hamburger, hero alerts). */
  XL: 24,
} as const;

export type IconSizeKey = keyof typeof ICON_SIZE;

/** Lucide stroke widths. `MEDIUM` is the project default. */
export const ICON_STROKE = {
  NORMAL: 1.75,
  MEDIUM: 2,
  /** Slightly heavier (e.g. small badge icons that need to read at 13px). */
  BOLD: 2.4,
} as const;

export type IconStrokeKey = keyof typeof ICON_STROKE;

export const ICON_THEME = {
  MAJE_BRAND,
  MAJE_BRAND_STRONG,

  GLYPH_ON_FILLED_BOX: COLORS.WHITE,

  METRIC_ICON_BOX_SHADOW: LAYOUT.SHADOW.SM,
  METRIC_ICON_BOX_SIZE: "2.5rem",
  METRIC_ICON_BOX_RADIUS: LAYOUT.RADIUS.LG,
  /** @deprecated Use `ICON_SIZE.LG` instead. Kept for back-compat. */
  METRIC_LUCIDE_SIZE: ICON_SIZE.LG,

  /**
   * Clickable icon controls (e.g. session “open schedule”) — wash + brand glyph, no filled
   * metric tile / shadow so they read as actions, not static KPI chrome.
   */
  ACTION_LINK_SIZE: "2.25rem",
  ACTION_LINK_BACKGROUND: BRAND_WASH_8,
  ACTION_LINK_BACKGROUND_HOVER: "rgba(95, 111, 149, 0.16)",
  ACTION_LINK_BORDER: ICON_SECONDARY_BORDER,
  ACTION_LINK_FOREGROUND: MAJE_BRAND,
  /** @deprecated Use `ICON_SIZE.MD` instead. Kept for back-compat. */
  ACTION_LINK_LUCIDE_SIZE: ICON_SIZE.MD,

  AVATAR_PLACEHOLDER_BACKGROUND: MAJE_ICON_BOX_MUTED,
  AVATAR_PLACEHOLDER_GLYPH: COLORS.WHITE,

  INLINE_MUTED: "#64748b",
  INLINE_SUBTLE: "#94a3b8",

  FOCUS_RING_NEUTRAL: "rgba(95, 111, 149, 0.45)",
} as const;
