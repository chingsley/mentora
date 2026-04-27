/**
 * Layout dimensions and breakpoints. Sizes in rem so they scale with root font-size.
 */
export const LAYOUT = {
  RADIUS: {
    SM: "0.375rem", // 6px
    MD: "0.5rem", // 8px
    LG: "0.75rem", // 12px
    XL: "1rem", // 16px
    FULL: "9999px",
  },
  SHADOW: {
    SM: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    MD: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    LG: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
    XL: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
  },
  Z: {
    DROPDOWN: 100,
    STICKY: 200,
    OVERLAY: 800,
    MODAL: 1000,
    TOAST: 1100,
  },
  SIDEBAR_WIDTH: "16rem", // 256px
  SIDEBAR_WIDTH_COLLAPSED: "4rem", // 64px
  HEADER_HEIGHT: "3.5rem", // 56px
  CONTENT_MAX_WIDTH: "80rem", // 1280px
  BREAKPOINTS: {
    SM: "640px",
    MD: "768px",
    LG: "1024px",
    XL: "1280px",
    "2XL": "1536px",
  },
  MEDIA: {
    SM: "@media (min-width: 640px)",
    MD: "@media (min-width: 768px)",
    LG: "@media (min-width: 1024px)",
    XL: "@media (min-width: 1280px)",
    REDUCED_MOTION: "@media (prefers-reduced-motion: reduce)",
  },
} as const;
