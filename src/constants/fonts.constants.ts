/**
 * Typography tokens. All sizes in rem so they scale with root font-size.
 *
 * UI font (Inter) is loaded once via `next/font` in `src/lib/app-font.ts`
 * and bound to `FONT_FACE.APP_UI_VARIABLE` on `<html>` in `src/app/layout.tsx`.
 * `FONTS.FAMILY.PRIMARY` references that variable with a safe fallback when the
 * variable is unset (e.g. tests).
 */

/** Must match the string literal `variable` in `src/lib/app-font.ts`. */
export const FONT_FACE = {
  APP_UI_VARIABLE: "--font-inter",
} as const;

/** Portable stack after the UI webfont (also used as `var(...)` fallback). */
export const FONT_STACK_SANS_FALLBACK =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const FONTS = {
  FAMILY: {
    /** Inter (when loaded) + system UI stack. */
    PRIMARY: `var(${FONT_FACE.APP_UI_VARIABLE}, ${FONT_STACK_SANS_FALLBACK})`,
    MONO:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  SIZE: {
    /** 10px — micro chrome (calendar week numbers, tiny status pips). */
    MICRO: "0.625rem",
    /** 11px — meta text on chips, badges, table footnotes. */
    META: "0.6875rem", // 11px
    XS: "0.75rem", // 12px
    "2XS": "0.8125rem", // 13px
    SM: "0.875rem", // 14px
    MD: "0.9375rem", // 15px
    BASE: "1rem", // 16px
    /** 17px — dashboard card titles, KPI emphasis text. */
    UI_LARGE: "1.0625rem",
    LG: "1.125rem", // 18px
    /** 22px — section titles, compact headers. */
    PAGE_HEADER: "1.375rem",
    /** 32px — primary in-app page title (h1). */
    H1: "2rem",
    "2XL": "1.5rem", // 24px
    /** 28px — KPI / stat value displays. */
    STAT_VALUE: "1.75rem",
    "3XL": "1.875rem", // 30px
    AUTH_TITLE: "2rem", // 32px
    /** 34px — auth scene hero headline (mobile). */
    AUTH_HERO_TITLE: "2.125rem",
    "4XL": "2.25rem", // 36px
    /** 48px — marketing hero headline. */
    HERO: "3rem",
    /** 56px — large marketing hero (Apple-style landing titles). */
    MARKETING_HERO: "3.5rem",
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
    RELAXED: 1.6,
  },
  LETTER_SPACING: {
    HERO: "-0.03em",
    TITLE: "-0.02em",
  },
} as const;
