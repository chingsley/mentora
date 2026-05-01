export interface TeacherDashboardStat {
  label: string;
  value: string;
  hint: string;
  trend?: string;
  trendPositive?: boolean;
  footerLink?: { href: string; label: string };
  tone: "blue" | "green" | "purple" | "orange";
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

export interface TeacherDashboardPayload {
  teacherName: string;
  teacherImage: string | null;
  profileCompleted: boolean;
  stats: TeacherDashboardStat[];
  classes: TeacherDashboardClassRow[];
  upcomingSessions: TeacherDashboardUpcomingSession[];
  chartValuesMinor: number[];
  earningsTotalFormatted: string;
  earningsTrendLabel: string;
  chartCurrency: string;
  activity: TeacherDashboardActivityItem[];
  messages: TeacherDashboardMessageItem[];
  /** ISO timestamps for chart X axis labels */
  chartDayKeys: string[];
}
