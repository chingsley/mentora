/**
 * Shared visual tokens for text fields (native input, select, textarea) and
 * matching controls on profile flows. Change border width / radius here once.
 */
import { COLORS } from "./colors.constants";
import { SPACING } from "./spacing.constants";
import { SURFACE } from "./surface.constants";

/** Canonical app-wide height for single-line text controls. */
export const APP_INPUT_HEIGHT = "3rem";

export const FORM_FIELD = {
  CONTROL_BORDER_WIDTH: "2px",
  CONTROL_RADIUS: SURFACE.RADIUS,
  CONTROL_MIN_HEIGHT: APP_INPUT_HEIGHT,
  CONTROL_PADDING_INLINE: SPACING.THREE,
  CONTROL_BACKGROUND: COLORS.FOREGROUND,
} as const;

/** Default or error border shorthand for form controls. */
export function formFieldControlBorder(hasError: boolean): string {
  return `${FORM_FIELD.CONTROL_BORDER_WIDTH} solid ${hasError ? COLORS.DESTRUCTIVE : COLORS.BORDER}`;
}