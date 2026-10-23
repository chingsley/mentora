import { FONTS } from "./fonts.constants";
import { SPACING } from "./spacing.constants";

/** Max characters for the teacher profile short bio (experience, style, expectations). */
export const TEACHER_BIO_MAX_LENGTH = 500;

/** Default visible height for the teacher bio textarea in profile forms. */
export const TEACHER_BIO_TEXTAREA_MIN_HEIGHT = "6rem";

export const TEACHER_CONTACT_PHONE_MAX_LENGTH = 32;

export const TEACHER_CONTACT_ADDRESS_MAX_LENGTH = 500;

export const TEACHER_CONTACT_ADDRESS_TEXTAREA_MIN_HEIGHT = "4.5rem";

/** Vertical gap between fields in the contact-details edit card (4px). */
export const TEACHER_CONTACT_EDIT_FIELD_GAP = SPACING.TWO;

/** Single-line label row height for compact contact edit fields. */
export const TEACHER_CONTACT_EDIT_LABEL_MIN_HEIGHT = `calc(${FONTS.SIZE.SM} * ${FONTS.LINE_HEIGHT.NORMAL})`;
