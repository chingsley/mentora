/**
 * Color palette for Mentora.
 * Mirrors the previous Tailwind `@theme` tokens 1:1 so visual fidelity is preserved.
 */
export const COLORS = {
  TRANSPARENT: "transparent",

  // Surfaces
  BACKGROUND: "#f5f5f7",
  FOREGROUND: "#ffffff",

  // Text
  TEXT: "#020817",
  TEXT_MUTED: "#64748b",
  HEADER: "#172033",

  // Brand
  PRIMARY: "#172033",
  PRIMARY_FOREGROUND: "#ffffff",
  ACCENT: "#4f46e5",
  ACCENT_FOREGROUND: "#ffffff",

  // Neutrals
  MUTED: "#e5e7eb",
  MUTED_FOREGROUND: "#64748b",
  BORDER: "#e2e8f0",
  RING: "#172033",

  // Semantic
  DESTRUCTIVE: "#dc2626",
  DESTRUCTIVE_FOREGROUND: "#ffffff",
  SUCCESS: "#16a34a",
  WARNING: "#d97706",
  INFO: "#2563eb",

  // Translucent overlays / borders (replacements for tailwind's `ring-black/5`, `border-header/15`, etc.)
  RING_BLACK_5: "rgba(0, 0, 0, 0.05)",
  RING_BLACK_10: "rgba(0, 0, 0, 0.10)",
  HEADER_BORDER_15: "rgba(23, 32, 51, 0.15)",
  HEADER_BORDER_25: "rgba(23, 32, 51, 0.25)",

  // Backdrops
  MODAL_BACKDROP: "rgba(0, 0, 0, 0.5)",
  MODAL_SHADOW: "rgba(0, 0, 0, 0.15)",
  MODAL_SHADOW_SOFT: "rgba(0, 0, 0, 0.08)",

  // Status pills
  STATUS_PRESENT_BG: "#dcfce7",
  STATUS_PRESENT_TEXT: "#166534",
  STATUS_LATE_BG: "#fef3c7",
  STATUS_LATE_TEXT: "#92400e",
  STATUS_ABSENT_BG: "#fee2e2",
  STATUS_ABSENT_TEXT: "#991b1b",
  STATUS_EXCUSED_BG: "#e0e7ff",
  STATUS_EXCUSED_TEXT: "#3730a3",
  STATUS_PENDING_BG: "#f1f5f9",
  STATUS_PENDING_TEXT: "#475569",

  // Misc
  WHITE: "#ffffff",
  BLACK: "#000000",
} as const;
