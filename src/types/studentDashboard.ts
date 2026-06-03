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

export interface StudentDashboardPayload {
  studentName: string;
  studentImage: string | null;
  stats: StudentDashboardStat[];
  classes: StudentDashboardClassRow[];
  upcomingSessions: StudentDashboardUpcomingSession[];
  assignments: StudentDashboardAssignmentItem[];
}
