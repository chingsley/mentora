/**
 * Color palette for Mentora.
 * Mirrors the previous Tailwind `@theme` tokens 1:1 so visual fidelity is preserved.
 */
export const COLORS = {
  TRANSPARENT: "transparent",

  // Surfaces
  // BACKGROUND: "#f5f5f7",
  BACKGROUND: "rgb(248 248 248)",
  FOREGROUND: "#ffffff",

  // Text
  TEXT: "#020817",
  HEADER: "#172033",

  // Brand
  PRIMARY: "#172033",

  /**
   * Primary clickable / interactive accent (links, primary buttons, active tab, info pills).
   * Use these tokens for ANY blue clickable item or its translucent variants.
   * Never reintroduce raw `#2563eb`, `#1d4ed8`, or `rgba(37, 99, 235, …)` literals.
   */
  ACTION_PRIMARY: "#2563eb",
  ACTION_PRIMARY_HOVER: "#1d4ed8",
  ACTION_PRIMARY_TINT_06: "rgba(37, 99, 235, 0.06)",
  ACTION_PRIMARY_TINT_10: "rgba(37, 99, 235, 0.10)",
  ACTION_PRIMARY_TINT_16: "rgba(37, 99, 235, 0.16)",
  ACTION_PRIMARY_BORDER_22: "rgba(37, 99, 235, 0.22)",
  ACTION_PRIMARY_BORDER_25: "rgba(37, 99, 235, 0.25)",
  ACTION_PRIMARY_RING_28: "rgba(37, 99, 235, 0.28)",
  ACTION_PRIMARY_RING_45: "rgba(37, 99, 235, 0.45)",
  ACTION_PRIMARY_DISABLED_TEXT: "rgba(37, 99, 235, 0.42)",
  ACTION_PRIMARY_SHADOW_MD: "0 8px 16px rgba(37, 99, 235, 0.16)",

  // Neutrals
  MUTED: "#e5e7eb",
  MUTED_FOREGROUND: "#64748b",
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

  // App shell sidebar — aligned with Maje portal (`.maje-teacher-db .sidebar`: `--surface`, `--ink`, `--muted`)
  SIDEBAR_MUTED: "#4d566b",
  SIDEBAR_ACCENT: "#5a6888",
  SIDEBAR_BRAND: "#5f6f95",
  SIDEBAR_HOVER: "rgba(95, 111, 149, 0.06)",
  SIDEBAR_ACTIVE_BG: "rgba(95, 111, 149, 0.1)",
  SIDEBAR_ROLE: "#7c879d",
  SIDEBAR_AVATAR_BG: "rgba(95, 111, 149, 0.12)",
  /** Maje `.nav-link:hover` bottom border */
  SIDEBAR_NAV_BORDER_HOVER: "#8b9bb4",
  SIDEBAR_FOCUS_RING: "rgba(95, 111, 149, 0.45)",

  // Misc
  WHITE: "#ffffff",

  // Buttons (canonical primary/secondary roles, used by `Button` and any matching CTA)
  /** Primary CTA fill (alias of `HEADER`/`PRIMARY` so button system tokens are explicit). */
  BUTTON_PRIMARY_BG: "#172033",
  /** Primary CTA hover fill — slightly lifted from `BUTTON_PRIMARY_BG`. */
  BUTTON_PRIMARY_BG_HOVER: "rgba(23, 32, 51, 0.92)",
  /** Primary CTA glyph/text color. */
  BUTTON_PRIMARY_TEXT: "#ffffff",
  /** Secondary CTA fill (neutral wash). */
  BUTTON_SECONDARY_BG: "#e5e7eb",
  /** Secondary CTA hover fill — slate-300. */
  BUTTON_SECONDARY_BG_HOVER: "#cbd5e1",
  /** Secondary CTA glyph/text color (near-black ink). */
  BUTTON_SECONDARY_TEXT: "#171717",
} as const;
