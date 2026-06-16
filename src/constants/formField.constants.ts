/**
 * Shared visual tokens for text fields (native input, select, textarea) and
 * matching controls on profile flows. Change border width / radius here once.
 */
import { COLORS } from "./colors.constants";
import { FONTS } from "./fonts.constants";
import { ICON_SIZE, ICON_STROKE } from "./iconTheme.constants";
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
  PLACEHOLDER_COLOR: COLORS.INPUT_PLACEHOLDER,
  /** Distance from the control's right inner edge to the chevron (matches date fields). */
  CONTROL_CHEVRON_INSET: SPACING.THREE,
  /** Gap between select label text and the chevron glyph. */
  CONTROL_CHEVRON_TEXT_GAP: SPACING.TWO,
  CONTROL_CHEVRON_SIZE: `${ICON_SIZE.XS}px`,
  /** Width for typed 12-hour times like `12:00`. */
  CONTROL_TIME_TEXT_WIDTH: `calc(${SPACING.TEN} + ${SPACING.SIX})`,
  /** Width for compact AM/PM selects beside time text fields. */
  CONTROL_MERIDIEM_WIDTH: `calc(${SPACING.TEN} * 2)`,
  /** Fixed label row height so inline field pairs keep controls aligned. */
  LABEL_SLOT_MIN_HEIGHT: `calc(${FONTS.SIZE.SM} * ${FONTS.LINE_HEIGHT.NORMAL} * 2)`,
} as const;

/** Default or error border shorthand for form controls. */
export function formFieldControlBorder(hasError: boolean): string {
  return `${FORM_FIELD.CONTROL_BORDER_WIDTH} solid ${hasError ? COLORS.DESTRUCTIVE : COLORS.BORDER}`;
}

function formFieldSelectChevronSvg(strokeColor: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE.XS}" height="${ICON_SIZE.XS}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${ICON_STROKE.NORMAL}" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
}

/** Native `<select>` chevron chrome aligned with {@link CalendarDateField} trigger spacing. */
export function formFieldSelectChevronStyles(
  strokeColor: string = COLORS.MUTED_FOREGROUND,
): string {
  const chevron = encodeURIComponent(formFieldSelectChevronSvg(strokeColor));

  return `
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    padding-right: calc(${FORM_FIELD.CONTROL_CHEVRON_INSET} + ${FORM_FIELD.CONTROL_CHEVRON_SIZE} + ${FORM_FIELD.CONTROL_CHEVRON_TEXT_GAP});
    background-image: url("data:image/svg+xml,${chevron}");
    background-repeat: no-repeat;
    background-position: right ${FORM_FIELD.CONTROL_CHEVRON_INSET} center;
    background-size: ${FORM_FIELD.CONTROL_CHEVRON_SIZE} ${FORM_FIELD.CONTROL_CHEVRON_SIZE};
  `;
}