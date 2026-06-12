/**
 * Color palette for Mentora.
 * Mirrors the previous Tailwind `@theme` tokens 1:1 so visual fidelity is preserved.
 */
export const COLORS = {
  TRANSPARENT: "transparent",

  // Surfaces
  /** Apple-style system gray canvas (marketing + default page background). */
  BACKGROUND: "#f5f5f7",
  FOREGROUND: "#ffffff",
  /**
   * Authenticated app shell main content surface (student, teacher, guardian).
   * Applied once on `<Main>` in `AppShellClient`. Retune this token to change
   * the page background across every in-app route.
   */
  APP_MAIN_BACKGROUND: "#ffffff",
  /**
   * Authenticated app shell sidebar surface (student, teacher, guardian).
   * Applied once on `<Sidebar>` in `AppShellClient`. Retune this token to change
   * the sidebar background across the entire app.
   */
  APP_SIDEBAR_BACKGROUND: "#ffffff",
  /** Primary sidebar text / ink (brand links, nav labels, account menu). */
  APP_SIDEBAR_TEXT: "#1d1d1f",
  /** Sidebar dividers and outer border (brand, nav, footer, flyouts). */
  APP_SIDEBAR_BORDER: "#d2d2d7",

  // Text
  TEXT: "#020817",
  HEADER: "#172033",

  // Brand
  PRIMARY: "#172033",

  /**
   * Primary clickable / interactive accent (links, primary buttons, active tab, info pills).
   * Apple system blue — use these tokens for ANY accent clickable item or its translucent variants.
   */
  ACTION_PRIMARY: "#007aff",
  ACTION_PRIMARY_HOVER: "#0062cc",
  ACTION_PRIMARY_TINT_06: "rgba(0, 122, 255, 0.06)",
  ACTION_PRIMARY_TINT_10: "rgba(0, 122, 255, 0.10)",
  ACTION_PRIMARY_TINT_16: "rgba(0, 122, 255, 0.16)",
  ACTION_PRIMARY_BORDER_22: "rgba(0, 122, 255, 0.22)",
  ACTION_PRIMARY_BORDER_25: "rgba(0, 122, 255, 0.25)",
  ACTION_PRIMARY_RING_28: "rgba(0, 122, 255, 0.28)",
  ACTION_PRIMARY_RING_45: "rgba(0, 122, 255, 0.45)",
  ACTION_PRIMARY_DISABLED_TEXT: "rgba(0, 122, 255, 0.42)",
  ACTION_PRIMARY_SHADOW_MD: "0 8px 20px rgba(0, 122, 255, 0.18)",

  /** Marketing / landing page ink (Apple-style neutrals). */
  MARKETING_TEXT_PRIMARY: "#1d1d1f",
  MARKETING_TEXT_SECONDARY: "#86868b",
  MARKETING_TEXT_TERTIARY: "#aeaeb2",
  MARKETING_BORDER: "#d2d2d7",
  MARKETING_BORDER_STRONG: "#c7c7cc",
  MARKETING_SURFACE_SECONDARY: "#f2f2f7",
  /** Frosted marketing header fill (white @ 72%). */
  MARKETING_HEADER_SURFACE: "rgba(255, 255, 255, 0.72)",

  // Neutrals
  MUTED: "#e5e7eb",
  MUTED_FOREGROUND: "#64748b",
  /** Bottom stop for full-viewport page loader gradient (muted @ 35%). */
  PAGE_LOADER_GRADIENT_END: "rgba(229, 231, 235, 0.35)",
  /** Spinner track ring on page loader (muted-foreground @ 20%). */
  PAGE_LOADER_TRACK_BORDER: "rgba(100, 116, 139, 0.20)",
  BORDER: "#e2e8f0",
  RING: "#172033",
  /** Hover background for neutral surfaces (e.g. secondary button hover) — slate-50 */
  SURFACE_NEUTRAL_HOVER: "#f8fafc",
  /** Hover border for neutral surfaces (e.g. secondary button hover) — slate-300 */
  SURFACE_NEUTRAL_BORDER_HOVER: "#cbd5e1",
  /** Subtle border used in card chrome (e.g. teacher preview panels) */
  BORDER_SUBTLE_LIGHT: "#e8ecf1",

  // Semantic
  DESTRUCTIVE: "#ef4444",
  /** Light destructive wash (e.g. "live" status pill background) — red-600 @ 10% */
  DESTRUCTIVE_TINT_10: "rgba(220, 38, 38, 0.10)",
  /** Hover border for danger / destructive controls — red-200 */
  DESTRUCTIVE_BORDER_HOVER: "#fecaca",
  /** Hover background for danger / destructive controls (very light red wash) */
  DESTRUCTIVE_BG_HOVER: "#fff7f7",
  SUCCESS: "#16a34a",

  // Translucent overlays / borders (replacements for tailwind's `ring-black/5`, `border-header/15`, etc.)
  RING_BLACK_5: "rgba(0, 0, 0, 0.05)",
  RING_BLACK_10: "rgba(0, 0, 0, 0.10)",
  HEADER_BORDER_15: "rgba(23, 32, 51, 0.15)",
  HEADER_BORDER_25: "rgba(23, 32, 51, 0.25)",

  // Backdrops
  MODAL_BACKDROP: "rgba(0, 0, 0, 0.5)",

  // Status pills
  STATUS_PRESENT_BG: "#dcfce7",
  STATUS_PRESENT_TEXT: "#166534",
  STATUS_LATE_BG: "#fef3c7",
  STATUS_LATE_TEXT: "#92400e",
  STATUS_ABSENT_BG: "#fee2e2",
  STATUS_ABSENT_TEXT: "#991b1b",
  STATUS_EXCUSED_BG: "#e0e7ff",
  STATUS_EXCUSED_TEXT: "#3730a3",

  /** Calendar slot blocked for viewers not on the invite list */
  CALENDAR_BLOCKED_BG: "#f1f5f9",
  CALENDAR_BLOCKED_BG_HOVER: "#e2e8f0",
  CALENDAR_BLOCKED_BORDER: "#cbd5e1",
  CALENDAR_BLOCKED_TEXT: "#475569",

  /** Time-grid chrome (day/week views) */
  CALENDAR_TODAY_COLUMN_BG: "rgba(0, 122, 255, 0.06)",
  CALENDAR_TODAY_COLUMN_BORDER: "rgba(0, 122, 255, 0.35)",
  CALENDAR_NOW_LINE: "#007aff",
  CALENDAR_NOW_LINE_FADED: "rgba(0, 122, 255, 0.35)",
  CALENDAR_GRID_HOUR_LINE: "#e2e8f0",
  CALENDAR_GRID_HALF_HOUR_LINE: "rgba(226, 232, 240, 0.75)",

  /** Month-view event chips */
  CALENDAR_EVENT_BG: "rgba(0, 122, 255, 0.1)",
  CALENDAR_EVENT_BG_HOVER: "rgba(0, 122, 255, 0.16)",
  CALENDAR_EVENT_ACCENT: "#007aff",
  CALENDAR_EVENT_TEXT: "#004999",
  CALENDAR_OUT_OF_MONTH_BG: "rgba(248, 248, 248, 0.85)",

  /** Teacher calendar: invite-only (reserved) class lock icon */
  CALENDAR_RESERVED_ICON: "rgba(95, 111, 149, 0.85)",

  // App shell sidebar
  SIDEBAR_MUTED: "#86868b",
  SIDEBAR_ACCENT: "#007aff",
  SIDEBAR_BRAND: "#007aff",
  SIDEBAR_HOVER: "rgba(0, 122, 255, 0.06)",
  SIDEBAR_ACTIVE_BG: "rgba(0, 122, 255, 0.10)",
  SIDEBAR_ROLE: "#86868b",
  SIDEBAR_AVATAR_BG: "rgba(0, 122, 255, 0.10)",
  SIDEBAR_NAV_BORDER_HOVER: "#d2d2d7",
  SIDEBAR_FOCUS_RING: "rgba(0, 122, 255, 0.45)",

  // Misc
  WHITE: "#ffffff",

  // Buttons (canonical primary/secondary roles, used by `Button` and any matching CTA)
  /** Primary CTA fill — system blue (matches marketing/auth). */
  BUTTON_PRIMARY_BG: "#007aff",
  /** Primary CTA hover fill. */
  BUTTON_PRIMARY_BG_HOVER: "#0062cc",
  /** Primary CTA glyph/text color. */
  BUTTON_PRIMARY_TEXT: "#ffffff",
  /** Primary text on saturated accent surfaces (meets WCAG AA on `BUTTON_PRIMARY_BG_HOVER`). */
  ON_ACCENT_TEXT: "#ffffff",
  /** Secondary text on saturated accent surfaces. */
  ON_ACCENT_TEXT_MUTED: "rgba(255, 255, 255, 0.85)",
  /** Inset icon/chip wash on saturated accent surfaces. */
  ON_ACCENT_SURFACE: "rgba(255, 255, 255, 0.15)",
  /** Secondary CTA fill (neutral wash). */
  BUTTON_SECONDARY_BG: "#e5e7eb",
  /** Secondary CTA hover fill — slate-300. */
  BUTTON_SECONDARY_BG_HOVER: "#cbd5e1",
  /** Secondary CTA glyph/text color (near-black ink). */
  BUTTON_SECONDARY_TEXT: "#171717",
} as const;
