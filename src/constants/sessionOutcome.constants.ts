import type { SessionNotHeldReason } from "@prisma/client";
import { ATTENDANCE_STATUS_LABEL } from "@/constants/attendance.constants";
import { COLORS } from "@/constants/colors.constants";

/** Visual marker kinds shown on past calendar tiles. */
export type SessionMarkerKind = "attended" | "late" | "absent" | "excused" | "not_held";

export const SESSION_NOT_HELD_REASON_LABEL: Record<SessionNotHeldReason, string> = {
  TEACHER_CANCELED: "Teacher canceled",
  TEACHER_UNAVAILABLE: "Teacher unavailable",
  STUDENT_REQUEST: "Student request",
  TECHNICAL_ISSUE: "Technical issue",
  OTHER: "Other",
};

export const SESSION_MARKER_LABEL: Record<SessionMarkerKind, string> = {
  attended: ATTENDANCE_STATUS_LABEL.PRESENT,
  late: ATTENDANCE_STATUS_LABEL.LATE,
  absent: ATTENDANCE_STATUS_LABEL.ABSENT,
  excused: ATTENDANCE_STATUS_LABEL.EXCUSED,
  not_held: "Session did not hold",
};

export interface SessionMarkerTheme {
  accent: string;
  bg: string;
  bgHover: string;
  text: string;
  border: string;
}

export const SESSION_MARKER_THEME: Record<SessionMarkerKind, SessionMarkerTheme> = {
  attended: {
    accent: COLORS.SUCCESS,
    bg: COLORS.STATUS_PRESENT_BG,
    bgHover: COLORS.STATUS_PRESENT_BG,
    text: COLORS.STATUS_PRESENT_TEXT,
    border: COLORS.STATUS_PRESENT_BG,
  },
  late: {
    accent: COLORS.STATUS_LATE_TEXT,
    bg: COLORS.STATUS_LATE_BG,
    bgHover: COLORS.STATUS_LATE_BG,
    text: COLORS.STATUS_LATE_TEXT,
    border: COLORS.STATUS_LATE_BG,
  },
  absent: {
    accent: COLORS.STATUS_ABSENT_TEXT,
    bg: COLORS.STATUS_ABSENT_BG,
    bgHover: COLORS.STATUS_ABSENT_BG,
    text: COLORS.STATUS_ABSENT_TEXT,
    border: COLORS.STATUS_ABSENT_BG,
  },
  excused: {
    accent: COLORS.STATUS_EXCUSED_TEXT,
    bg: COLORS.STATUS_EXCUSED_BG,
    bgHover: COLORS.STATUS_EXCUSED_BG,
    text: COLORS.STATUS_EXCUSED_TEXT,
    border: COLORS.STATUS_EXCUSED_BG,
  },
  not_held: {
    accent: COLORS.MUTED_FOREGROUND,
    bg: COLORS.CALENDAR_BLOCKED_BG,
    bgHover: COLORS.CALENDAR_BLOCKED_BG_HOVER,
    text: COLORS.CALENDAR_BLOCKED_TEXT,
    border: COLORS.CALENDAR_BLOCKED_BORDER,
  },
};
