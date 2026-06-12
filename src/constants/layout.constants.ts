/**
 * Layout dimensions and breakpoints. Sizes in rem so they scale with root font-size.
 */
import { COLORS } from "./colors.constants";
import { SPACING } from "./spacing.constants";

/** Shared card chrome shadow (teacher dashboard + profile card surfaces). */
export const BOX_SHADOW_CARD = "0 4px 24px rgba(44, 44, 46, 0.06)";

/** Shared input/control shell shadow (inputs, textareas, and matching controls). */
export const BOX_SHADOW_INPUTS = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";

export const LAYOUT = {
  RADIUS: {
    /** 4px — very subtle corners (marketing CTAs, Jitsi-style controls). */
    XS: "0.25rem",
    /** 6px — canonical radius for cards, dialogs, inputs, chips, and buttons. */
    SM: "0.375rem",
    MD: "0.5rem", // 8px
    LG: "0.75rem", // 12px
    XL: "1rem", // 16px
    FULL: "9999px",
  },
  SHADOW: {
    SM: BOX_SHADOW_INPUTS,
    MD: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    LG: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
    XL: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
  },
  Z: {
    STICKY: 200,
    /** Route transition progress bar (`NavigationProgress`). */
    NAVIGATION_PROGRESS: 250,
    MODAL: 1000,
    TOAST: 1100,
  },
  /** Shared `PageLoader` geometry and motion (App Router `loading.tsx`). */
  PAGE_LOADER: {
    SPINNER_SIZE: "3.75rem",
    MIN_HEIGHT: "min(70vh, 35rem)",
    GLOW_INSET: "4rem",
    GLOW_BLUR: "3rem",
    SHIMMER_TRACK_WIDTH: "6rem",
    SHIMMER_TRACK_HEIGHT: SPACING.ONE,
    SPIN_DURATION: "0.95s",
    SHIMMER_DURATION: "1.4s",
  },
  /**
   * Page chrome inset applied once on `<Main>` in AppShellClient. Every
   * authenticated route inherits this, so individual page components must
   * NOT add their own horizontal padding or use negative margins to fight it.
   *
   * Values use `clamp(min, fluid, max)` so the inset grows smoothly with
   * viewport width without media queries:
   *   - never tighter than `min` on small phones
   *   - scales fluidly with the viewport in the middle
   *   - never larger than `max` on ultra-wide monitors
   *
   * To retune the whole app, change these two values.
   */
  PAGE_INSET: {
    /** Horizontal padding: 16px → ~4vw → 32px. */
    INLINE: "clamp(1rem, 4vw, 2rem)",
    /** Vertical padding: 24px → ~4vw → 40px. */
    BLOCK: "clamp(1.5rem, 4vw, 2.5rem)",
  },
  /**
   * App shell chrome. Shell surfaces are applied once in `AppShellClient`:
   * - `<Sidebar>` — `SIDEBAR.BACKGROUND`, `SIDEBAR.TEXT`, `SIDEBAR.BORDER`
   * - `<Main>` — `MAIN_BACKGROUND`
   * Inner sidebar pieces (`AppSidebarChrome`, account menu, ward selector) consume
   * `APP_SHELL.SIDEBAR` tokens — never hardcode sidebar colors elsewhere.
   */
  APP_SHELL: {
    MAIN_BACKGROUND: COLORS.APP_MAIN_BACKGROUND,
    SIDEBAR: {
      BACKGROUND: COLORS.APP_SIDEBAR_BACKGROUND,
      TEXT: COLORS.APP_SIDEBAR_TEXT,
      BORDER: COLORS.APP_SIDEBAR_BORDER,
      MUTED: COLORS.SIDEBAR_MUTED,
      ACCENT: COLORS.SIDEBAR_ACCENT,
      BRAND: COLORS.SIDEBAR_BRAND,
      HOVER: COLORS.SIDEBAR_HOVER,
      ACTIVE_BG: COLORS.SIDEBAR_ACTIVE_BG,
      ROLE: COLORS.SIDEBAR_ROLE,
      AVATAR_BG: COLORS.SIDEBAR_AVATAR_BG,
      NAV_BORDER_HOVER: COLORS.SIDEBAR_NAV_BORDER_HOVER,
      FOCUS_RING: COLORS.SIDEBAR_FOCUS_RING,
      NAV_ITEM_ACTIVE_BACKGROUND: COLORS.APP_SIDEBAR_BACKGROUND,
      WIDTH: "16rem",
      WIDTH_COLLAPSED: "4rem",
      MOBILE_MAX_WIDTH: "18rem",
      /** Mobile drawer elevation on `<Sidebar>` (matches `LAYOUT.SHADOW.MD`). */
      MOBILE_SHADOW: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
      FOOTER_INSET_INLINE: SPACING.TWO,
    },
  },
  /** Minimum inline size before horizontal scroll on dense data tables (248px). */
  TABLE_MIN_WIDTH: "15.5rem",
  /** Readable max widths for in-page columns (not page chrome). */
  MAX_WIDTH: {
    /** Teacher profile Photo & bio form (~800px at 16px root); full width below `MEDIA.SM`. */
    TEACHER_PROFILE_BIO_FORM: "60rem",
  },
  MEDIA: {
    SM: "@media (min-width: 640px)",
    MD: "@media (min-width: 768px)",
    LG: "@media (min-width: 1024px)",
    REDUCED_MOTION: "@media (prefers-reduced-motion: reduce)",
  },
} as const;
