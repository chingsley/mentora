export interface TeacherDashboardStat {
  label: string;
  value: string;
  hint?: string;
  trend?: string;
  trendPositive?: boolean;
  footerLink?: { href: string; label: string };
  tone: "blue" | "green" | "purple" | "orange";
  /** Filled accent surface (blue background, light text). */
  accent?: boolean;
}

export interface TeacherDashboardClassRow {
  id: string;
  subjectName: string;
  title: string;
  studentCount: number;
  sessionLabel: string;
  priceLabel: string;
  status: "active" | "paused";
}

export interface TeacherDashboardUpcomingSession {
  id: string;
  monthShort: string;
  day: string;
  subjectName: string;
  subtitle: string;
  timeRange: string;
}

export interface TeacherDashboardActivityItem {
  id: string;
  studentName: string;
  studentImage: string | null;
  action: string;
  timeAgo: string;
}

export interface TeacherDashboardMessageItem {
  id: string;
  senderName: string;
  senderImage: string | null;
  preview: string;
  timeAgo: string;
  unread: boolean;
}

export interface TeacherDashboardChartPoint {
  label: string;
  /** Short label for the chart x-axis (e.g. "Jun 8"). */
  axisLabel?: string;
  value: number;
  valueFormatted?: string;
}

export interface TeacherDashboardCharts {
  currency: string;
  classesHeldThisMonth: {
    monthLabel: string;
    total: number;
    points: TeacherDashboardChartPoint[];
  };
  studentAttendancePast8Weeks: {
    averageFormatted: string;
    points: TeacherDashboardChartPoint[];
  };
}

export interface TeacherDashboardPayload {
  teacherName: string;
  teacherImage: string | null;
  profileCompleted: boolean;
  stats: TeacherDashboardStat[];
  charts: TeacherDashboardCharts;
  upcomingSessions: TeacherDashboardUpcomingSession[];
  activity: TeacherDashboardActivityItem[];
  messages: TeacherDashboardMessageItem[];
}
