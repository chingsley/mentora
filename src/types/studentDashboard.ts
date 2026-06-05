import type {
  TeacherDashboardStat,
  TeacherDashboardUpcomingSession,
} from "@/types/teacherDashboard";

export type StudentDashboardStat = TeacherDashboardStat;

export type StudentDashboardUpcomingSession = TeacherDashboardUpcomingSession;

export interface StudentDashboardClassRow {
  id: string;
  offeringId: string;
  subjectName: string;
  title: string;
  teacherName: string;
  sessionLabel: string;
  status: "active";
}

export interface StudentDashboardAssignmentItem {
  id: string;
  offeringId: string;
  title: string;
  subjectName: string;
  teacherName: string;
  dueLabel: string;
  timeAgo: string;
}

/** Per-subject billing line: completed (held) sessions × the subject rate, plus attendance tally. */
export interface StudentBillSubject {
  subjectId: string;
  subjectName: string;
  /** Per-session rate in the smallest currency unit. */
  rateMinor: number;
  rateFormatted: string;
  /** Held sessions in the past, attendance not considered. */
  sessionsCompleted: number;
  amountMinor: number;
  amountFormatted: string;
  present: number;
  absent: number;
  late: number;
}

export interface StudentBillSummary {
  currency: string;
  subjects: StudentBillSubject[];
  totalSubjects: number;
  totalSessions: number;
  totalAmountMinor: number;
  totalAmountFormatted: string;
}

export interface StudentDashboardPayload {
  studentName: string;
  studentImage: string | null;
  stats: StudentDashboardStat[];
  classes: StudentDashboardClassRow[];
  upcomingSessions: StudentDashboardUpcomingSession[];
  assignments: StudentDashboardAssignmentItem[];
}
