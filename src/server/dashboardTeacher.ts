import "server-only";

import { db } from "@/lib/db";
import {
  daysAgo,
  formatTimeAmPm,
  nextOccurrenceParts,
  sessionLabel,
} from "@/lib/dashboardSchedule";
import { formatPrice } from "@/lib/time";
import type {
  TeacherDashboardActivityItem,
  TeacherDashboardClassRow,
  TeacherDashboardPayload,
  TeacherDashboardStat,
  TeacherDashboardUpcomingSession,
} from "@/types/teacherDashboard";
import { getTeacherEarningsSummary } from "@/server/teacherEarnings";
import { getMyTeacherProfile } from "@/server/teachers";

type TeacherRateRow = {
  subjectId: string;
  regionId: string;
  hourlyRate: number;
  region: { currency: string };
};

function rateForSubject(
  subjectId: string,
  regionId: string | null,
  rates: TeacherRateRow[],
): TeacherRateRow | null {
  const match =
    regionId !== null ? rates.find((r) => r.subjectId === subjectId && r.regionId === regionId) : undefined;
  return match ?? rates.find((r) => r.subjectId === subjectId) ?? null;
}

export async function getTeacherDashboardPayload(userId: string): Promise<TeacherDashboardPayload | null> {
  const data = await getMyTeacherProfile(userId);
  if (!data) return null;

  const { profile, activeStudentCount } = data;
  const regionId = profile.user.region?.id ?? null;
  const currency =
    profile.user.region?.currency ?? profile.rates[0]?.region.currency ?? "USD";

  const rates = profile.rates as TeacherRateRow[];
  const activeOfferings = profile.offerings.filter((o) => o.active);
  const earnings = await getTeacherEarningsSummary(userId);

  const stats: TeacherDashboardStat[] = [
    {
      tone: "blue",
      label: "Total classes",
      value: String(activeOfferings.length),
      hint: "Active classes",
      trend:
        activeOfferings.length > 0
          ? `↑ ${activeOfferings.length} on your roster`
          : undefined,
      trendPositive: activeOfferings.length > 0,
      footerLink: { href: "/schedule", label: "View schedule →" },
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
      tone: "purple",
      label: "Net earnings",
      value: earnings?.netAmountFormatted ?? formatPrice(0, currency),
      hint:
        earnings && earnings.grossAmountMinor > 0
          ? `${earnings.commissionPercent}% platform fee applied`
          : "From completed sessions",
      trend:
        earnings && earnings.totalSessions > 0
          ? `↑ ${earnings.totalSessions} billable session${earnings.totalSessions === 1 ? "" : "s"}`
          : undefined,
      trendPositive: (earnings?.netAmountMinor ?? 0) > 0,
      footerLink: { href: "/earnings", label: "View earnings →" },
    },
    {
      tone: "orange",
      label: "Classes held",
      value: String(earnings?.totalClassesHeld ?? 0),
      hint: "Completed sessions to date",
      trend:
        earnings && earnings.totalClassesHeld > 0
          ? `↑ ${earnings.grossAmountFormatted} gross`
          : undefined,
      trendPositive: (earnings?.totalClassesHeld ?? 0) > 0,
    },
  ];

  const classes: TeacherDashboardClassRow[] = activeOfferings.slice(0, 8).map((o) => {
    const r = rateForSubject(o.subjectId, regionId, rates);
    return {
      id: o.id,
      subjectName: o.subject.name,
      title: o.title,
      studentCount: o.enrollments.length,
      sessionLabel: sessionLabel(o.dayOfWeek, o.startMinutes),
      priceLabel: r ? `${formatPrice(r.hourlyRate, r.region.currency)}/session` : "—",
      status: "active",
    };
  });

  const upcomingSessions: TeacherDashboardUpcomingSession[] = activeOfferings.slice(0, 6).map((o) => {
    const parts = nextOccurrenceParts(o.dayOfWeek, o.startMinutes);
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
    classes,
    upcomingSessions,
    activity,
    messages: [],
  };
}
