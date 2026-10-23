import "server-only";

import { db } from "@/lib/db";
import {
  daysAgo,
  formatTimeAmPm,
  nextOfferingOccurrenceAt,
  occurrenceDisplayParts,
  sortByNextOccurrence,
} from "@/lib/dashboardSchedule";
import type {
  TeacherDashboardActivityItem,
  TeacherDashboardPayload,
  TeacherDashboardStat,
  TeacherDashboardUpcomingSession,
} from "@/types/teacherDashboard";
import { getTeacherDashboardCharts } from "@/server/teacherDashboardCharts";
import { getMyTeacherProfile } from "@/server/teachers";

export async function getTeacherDashboardPayload(userId: string): Promise<TeacherDashboardPayload | null> {
  const data = await getMyTeacherProfile(userId);
  if (!data) return null;

  const { profile, activeStudentCount } = data;

  const activeOfferings = profile.offerings.filter((o) => o.active);
  const charts = await getTeacherDashboardCharts(profile);

  const stats: TeacherDashboardStat[] = [
    {
      tone: "blue",
      label: "Active classes",
      value: String(activeOfferings.length),
      trend:
        activeOfferings.length > 0
          ? `↑ ${activeOfferings.length} on your roster`
          : undefined,
      trendPositive: activeOfferings.length > 0,
      footerLink: { href: "/teacher/classes", label: "View classes" },
    },
    {
      tone: "green",
      label: "Total students",
      value: String(activeStudentCount),
      hint: "Across all classes",
      trend: activeStudentCount > 0 ? `↑ ${activeStudentCount} enrolled` : undefined,
      trendPositive: activeStudentCount > 0,
    },
    {
      tone: "orange",
      label: "Classes this month",
      value: String(charts.classesHeldThisMonth.total),
      hint: charts.classesHeldThisMonth.monthLabel,
      trend:
        charts.classesHeldThisMonth.total > 0
          ? `↑ ${charts.classesHeldThisMonth.total} completed`
          : undefined,
      trendPositive: charts.classesHeldThisMonth.total > 0,
      footerLink: { href: "/schedule", label: "View schedule" },
    },
  ];

  const now = new Date();
  const upcomingSessions: TeacherDashboardUpcomingSession[] = sortByNextOccurrence(
    activeOfferings,
    now,
  )
    .slice(0, 6)
    .map((o) => {
      const at = nextOfferingOccurrenceAt(o, now);
      const parts = occurrenceDisplayParts(at);
      const titleShort = o.title.length > 52 ? `${o.title.slice(0, 52)}…` : o.title;
      return {
        id: o.id,
        monthShort: parts.monthShort,
        day: parts.day,
        subjectName: o.subject.name,
        subtitle: titleShort,
        timeRange: `${formatTimeAmPm(o.startMinutes)} – ${formatTimeAmPm(o.endMinutes)}`,
      };
    });

  const recentEnrollments = await db.enrollment.findMany({
    where: {
      status: "ACTIVE",
      offering: { teacherProfileId: profile.id },
    },
    orderBy: { enrolledAt: "desc" },
    take: 5,
    include: {
      studentProfile: {
        include: { user: { select: { name: true, image: true } } },
      },
      offering: { include: { subject: true } },
    },
  });

  const activity: TeacherDashboardActivityItem[] = recentEnrollments.map((e) => ({
    id: e.id,
    studentName: e.studentProfile.user.name,
    studentImage: e.studentProfile.user.image,
    action: `Joined ${e.offering.subject.name} class`,
    timeAgo: daysAgo(e.enrolledAt),
  }));

  return {
    teacherName: profile.user.name,
    teacherImage: profile.user.image,
    profileCompleted: profile.profileCompleted,
    stats,
    charts,
    upcomingSessions,
    activity,
    messages: [],
  };
}
