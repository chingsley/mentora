/**
 * Typography tokens. All sizes in rem so they scale with root font-size.
 *
 * UI font (Plus Jakarta Sans) is loaded once via `next/font` in `src/lib/app-font.ts`
 * and bound to `FONT_FACE.APP_UI_VARIABLE` on `<html>` in `src/app/layout.tsx`.
 * `FONTS.FAMILY.PRIMARY` references that variable with a safe fallback when the
 * variable is unset (e.g. tests).
 */

/** Must match the string literal `variable` in `src/lib/app-font.ts`. */
export const FONT_FACE = {
  APP_UI_VARIABLE: "--font-plus-jakarta-sans",
} as const;

/** Portable stack after the UI webfont (also used as `var(...)` fallback). */
export const FONT_STACK_SANS_FALLBACK =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const FONTS = {
  FAMILY: {
    /** Plus Jakarta Sans (when loaded) + system UI stack. */
    PRIMARY: `var(${FONT_FACE.APP_UI_VARIABLE}, ${FONT_STACK_SANS_FALLBACK})`,
    MONO:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  SIZE: {
    XS: "0.75rem", // 12px
    "2XS": "0.8125rem", // 13px
    SM: "0.875rem", // 14px
    MD: "0.9375rem", // 15px
    BASE: "1rem", // 16px
    LG: "1.125rem", // 18px
    XL: "1.25rem", // 20px
    "2XL": "1.5rem", // 24px
    AUTH_TITLE: "2rem", // 32px
    "3XL": "1.875rem", // 30px
    "4XL": "2.25rem", // 36px
  },
  WEIGHT: {
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
  },
  LINE_HEIGHT: {
    TIGHT: 1.2,
    SNUG: 1.35,
    NORMAL: 1.5,
    RELAXED: 1.65,
  },
} as const;
