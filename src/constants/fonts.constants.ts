/**
 * Typography tokens. All sizes in rem so they scale with root font-size.
 */
export const FONTS = {
  FAMILY: {
    PRIMARY:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    MONO:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  SIZE: {
    XS: "0.75rem", // 12px
    SM: "0.875rem", // 14px
    BASE: "1rem", // 16px
    LG: "1.125rem", // 18px
    XL: "1.25rem", // 20px
    "2XL": "1.5rem", // 24px
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
