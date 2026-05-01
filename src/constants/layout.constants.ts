/**
 * Layout dimensions and breakpoints. Sizes in rem so they scale with root font-size.
 */
import { SPACING } from "./spacing.constants";

/** Shared card chrome shadow (teacher dashboard + profile card surfaces). */
export const BOX_SHADOW_CARD = "0 4px 24px rgba(19, 30, 53, 0.06)";

/** Shared input/control shell shadow (inputs, textareas, and matching controls). */
export const BOX_SHADOW_INPUTS = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";

export const LAYOUT = {
  RADIUS: {
    SM: "0.375rem", // 6px
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
    MODAL: 1000,
    TOAST: 1100,
  },
  SIDEBAR_WIDTH: "16rem", // 256px — rail width at `LAYOUT.MEDIA.LG` when expanded (`AppShellClient` sidebar)
  SIDEBAR_WIDTH_COLLAPSED: "4rem", // 64px — rail width at `LAYOUT.MEDIA.LG` when collapsed
  /**
   * Padding inside `AppSidebarChrome` footer (and the same inset used to full-bleed
   * `SidebarAccountMenu` flyouts to the sidebar rail). Adjust **only** this token to
   * change footer gutter + matching menu width together.
   */
  SIDEBAR_FOOTER_INSET_INLINE: SPACING.TWO,
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
    /** Horizontal padding: 12px → ~4vw → 32px. */
    INLINE: "clamp(2rem, 4vw, 1rem)",
    /** Vertical padding: 24px → ~4vw → 40px. */
    BLOCK: "clamp(1.5rem, 4vw, 0.5rem)",
  },
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
