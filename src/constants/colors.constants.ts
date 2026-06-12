/**
 * Mentora color system — 60 / 30 / 10 rule.
 *
 * - **60% white** — main backgrounds, cards, inputs, modals (`BACKGROUND`, `FOREGROUND`)
 * - **30% gray** — navigation, headings, body text, borders (`GRAY_*`, `HEADER`, `TEXT`)
 * - **10% teal** — actions, focus, active states (`ACCENT`, `ACTION_PRIMARY_*`)
 *
 * Brand accent `#26A69A` is used on dark surfaces and decorative UI. `ACTION_PRIMARY` is a
 * darker teal derivative so buttons and links on white meet WCAG AA (4.5:1).
 */
export const COLORS = {
  TRANSPARENT: "transparent",

  // —— 10% accent (teal) ——
  /** Brand teal — badges, progress, active nav on dark chrome, decorative icons. */
  ACCENT: "#26a69a",
  /**
   * Accessible teal for primary buttons, links, and focus on white surfaces.
   * Derived from `ACCENT`; ~4.8:1 with white button text.
   */
  ACTION_PRIMARY: "#1d7f78",
  ACTION_PRIMARY_HOVER: "#1a7a72",
  ACTION_PRIMARY_TINT_06: "rgba(38, 166, 154, 0.06)",
  ACTION_PRIMARY_TINT_10: "rgba(38, 166, 154, 0.10)",
  ACTION_PRIMARY_TINT_16: "rgba(38, 166, 154, 0.16)",
  ACTION_PRIMARY_BORDER_22: "rgba(38, 166, 154, 0.22)",
  ACTION_PRIMARY_BORDER_25: "rgba(38, 166, 154, 0.25)",
  ACTION_PRIMARY_RING_28: "rgba(38, 166, 154, 0.28)",
  ACTION_PRIMARY_RING_45: "rgba(38, 166, 154, 0.45)",
  ACTION_PRIMARY_DISABLED_TEXT: "rgba(38, 166, 154, 0.42)",
  ACTION_PRIMARY_SHADOW_MD: "0 8px 20px rgba(38, 166, 154, 0.18)",

  // —— 60% white surfaces ——
  /** Primary page canvas. */
  BACKGROUND: "#ffffff",
  /** Cards, inputs, modals. */
  FOREGROUND: "#ffffff",
  /** Off-white sections and hover washes. */
  SURFACE_OFF_WHITE: "#f5f5f7",
  SURFACE_OFF_WHITE_ALT: "#fafafa",
  /**
   * Authenticated app shell main content surface (student, teacher, guardian).
   * Applied once on `<Main>` in `AppShellClient`.
   */
  APP_MAIN_BACKGROUND: "#ffffff",

  // —— 30% gray structure ——
  /** Dark gray — sidebars, nav bars, headings. */
  GRAY_DARK: "#2c2c2e",
  GRAY_DARK_ALT: "#1c1c1e",
  /** Body text on white. */
  GRAY_TEXT_BODY: "#3a3a3c",
  /** Secondary / supporting text on white. */
  GRAY_TEXT_SECONDARY: "#48484a",
  /** Accessible tertiary text on white. */
  GRAY_TEXT_TERTIARY: "#6e6e73",
  /** Borders and dividers. */
  GRAY_BORDER: "#d2d2d7",
  GRAY_BORDER_LIGHT: "#e5e5ea",

  /**
   * Authenticated app shell sidebar (student, teacher, guardian).
   * Applied once on `<Sidebar>` in `AppShellClient`.
   */
  APP_SIDEBAR_BACKGROUND: "#2c2c2e",
  /** Primary sidebar text on dark chrome. */
  APP_SIDEBAR_TEXT: "#ffffff",
  /** Sidebar dividers on dark chrome. */
  APP_SIDEBAR_BORDER: "rgba(255, 255, 255, 0.15)",

  // Text & headings (aliases onto gray structure)
  TEXT: "#3a3a3c",
  HEADER: "#2c2c2e",
  PRIMARY: "#2c2c2e",

  /** Marketing / landing page ink. */
  MARKETING_TEXT_PRIMARY: "#2c2c2e",
  MARKETING_TEXT_SECONDARY: "#48484a",
  MARKETING_TEXT_TERTIARY: "#6e6e73",
  MARKETING_BORDER: "#d2d2d7",
  MARKETING_BORDER_STRONG: "#c7c7cc",
  MARKETING_SURFACE_SECONDARY: "#f5f5f7",
  /** Frosted marketing header fill (white @ 72%). */
  MARKETING_HEADER_SURFACE: "rgba(255, 255, 255, 0.72)",

  // Neutrals
  MUTED: "#e5e5ea",
  MUTED_FOREGROUND: "#48484a",
  PAGE_LOADER_GRADIENT_END: "rgba(229, 229, 234, 0.35)",
  PAGE_LOADER_TRACK_BORDER: "rgba(72, 72, 74, 0.20)",
  BORDER: "#e5e5ea",
  RING: "#2c2c2e",
  SURFACE_NEUTRAL_HOVER: "#f5f5f7",
  SURFACE_NEUTRAL_BORDER_HOVER: "#d2d2d7",
  BORDER_SUBTLE_LIGHT: "#e5e5ea",

  // Semantic
  DESTRUCTIVE: "#ef4444",
  DESTRUCTIVE_TINT_10: "rgba(220, 38, 38, 0.10)",
  DESTRUCTIVE_BORDER_HOVER: "#fecaca",
  DESTRUCTIVE_BG_HOVER: "#fff7f7",
  SUCCESS: "#16a34a",

  // Translucent overlays / borders
  RING_BLACK_5: "rgba(0, 0, 0, 0.05)",
  RING_BLACK_10: "rgba(0, 0, 0, 0.10)",
  HEADER_BORDER_15: "rgba(44, 44, 46, 0.15)",
  HEADER_BORDER_25: "rgba(44, 44, 46, 0.25)",

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
  CALENDAR_BLOCKED_BG: "#f5f5f7",
  CALENDAR_BLOCKED_BG_HOVER: "#e5e5ea",
  CALENDAR_BLOCKED_BORDER: "#d2d2d7",
  CALENDAR_BLOCKED_TEXT: "#48484a",

  /** Time-grid chrome (day/week views) */
  CALENDAR_TODAY_COLUMN_BG: "rgba(38, 166, 154, 0.06)",
  CALENDAR_TODAY_COLUMN_BORDER: "rgba(38, 166, 154, 0.35)",
  CALENDAR_NOW_LINE: "#26a69a",
  CALENDAR_NOW_LINE_FADED: "rgba(38, 166, 154, 0.35)",
  CALENDAR_GRID_HOUR_LINE: "#e5e5ea",
  CALENDAR_GRID_HALF_HOUR_LINE: "rgba(229, 229, 234, 0.75)",

  /** Month-view event chips */
  CALENDAR_EVENT_BG: "rgba(38, 166, 154, 0.10)",
  CALENDAR_EVENT_BG_HOVER: "rgba(38, 166, 154, 0.16)",
  CALENDAR_EVENT_ACCENT: "#26a69a",
  CALENDAR_EVENT_TEXT: "#1a7a72",
  CALENDAR_OUT_OF_MONTH_BG: "rgba(250, 250, 250, 0.85)",

  /** Teacher calendar: invite-only (reserved) class lock icon */
  CALENDAR_RESERVED_ICON: "rgba(72, 72, 74, 0.85)",

  // App shell sidebar
  SIDEBAR_MUTED: "#aeaeb2",
  SIDEBAR_ACCENT: "#26a69a",
  SIDEBAR_BRAND: "#26a69a",
  SIDEBAR_HOVER: "rgba(255, 255, 255, 0.08)",
  SIDEBAR_ACTIVE_BG: "rgba(38, 166, 154, 0.15)",
  SIDEBAR_ROLE: "#aeaeb2",
  SIDEBAR_AVATAR_BG: "rgba(38, 166, 154, 0.15)",
  SIDEBAR_NAV_BORDER_HOVER: "rgba(255, 255, 255, 0.20)",
  SIDEBAR_FOCUS_RING: "rgba(38, 166, 154, 0.45)",

  // Misc
  WHITE: "#ffffff",

  // Buttons (canonical primary/secondary roles, used by `Button` and any matching CTA)
  BUTTON_PRIMARY_BG: "#1d7f78",
  BUTTON_PRIMARY_BG_HOVER: "#1a7a72",
  BUTTON_PRIMARY_TEXT: "#ffffff",
  /** Primary text on saturated accent surfaces (meets WCAG AA on `BUTTON_PRIMARY_BG`). */
  ON_ACCENT_TEXT: "#ffffff",
  /** Secondary text on saturated accent surfaces. */
  ON_ACCENT_TEXT_MUTED: "rgba(255, 255, 255, 0.85)",
  /** Inset icon/chip wash on saturated accent surfaces. */
  ON_ACCENT_SURFACE: "rgba(255, 255, 255, 0.15)",
  BUTTON_SECONDARY_BG: "#e5e5ea",
  BUTTON_SECONDARY_BG_HOVER: "#d2d2d7",
  BUTTON_SECONDARY_TEXT: "#3a3a3c",
} as const;
