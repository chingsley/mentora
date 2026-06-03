import type { AttendanceStatus } from "@prisma/client";
import { COLORS } from "@/constants/colors.constants";

/** Ms before scheduled start when teachers may open attendance (matches join window). */
export const SESSION_ATTENDANCE_EARLY_MS = 15 * 60 * 1000;

/** System-generated attendance log comments. */
export const ATTENDANCE_SYSTEM_COMMENT = {
  STUDENT_JOINED: "system - student joined",
  STUDENT_DID_NOT_ATTEND: "system - student didn't attend",
} as const;

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  LATE: "Late",
  ABSENT: "Absent",
  EXCUSED: "Excused",
};

export const ATTENDANCE_STATUS_THEME: Record<
  AttendanceStatus,
  { bg: string; text: string; border: string }
> = {
  PRESENT: {
    bg: COLORS.STATUS_PRESENT_BG,
    text: COLORS.STATUS_PRESENT_TEXT,
    border: COLORS.STATUS_PRESENT_BG,
  },
  LATE: {
    bg: COLORS.STATUS_LATE_BG,
    text: COLORS.STATUS_LATE_TEXT,
    border: COLORS.STATUS_LATE_BG,
  },
  ABSENT: {
    bg: COLORS.STATUS_ABSENT_BG,
    text: COLORS.STATUS_ABSENT_TEXT,
    border: COLORS.STATUS_ABSENT_BG,
  },
  EXCUSED: {
    bg: COLORS.STATUS_EXCUSED_BG,
    text: COLORS.STATUS_EXCUSED_TEXT,
    border: COLORS.STATUS_EXCUSED_BG,
  },
};
