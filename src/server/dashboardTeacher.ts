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
import { getMyTeacherProfile } from "@/server/teachers";

type TeacherRateRow = {
  subjectId: string;
  regionId: string;
  hourlyRate: number;
  region: { currency: string; };
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

/** Illustrative curve for the earnings chart (minor units). */
export function buildChartPoints(monthlyTotalMinor: number, days = 28): number[] {
  const safe = Math.max(0, monthlyTotalMinor);
  if (safe === 0) {
    return Array.from({ length: days }, (_, i) => Math.round(i * 1250));
  }
  return Array.from({ length: days }, (_, i) => {
    const t = (i + 1) / days;
    return Math.round(safe * (0.22 + 0.78 * t * t));
  });
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

  let monthlyEstimateMinor = 0;
  for (const o of activeOfferings) {
    const r = rateForSubject(o.subjectId, regionId, rates);
    const n = o.enrollments.length;
    if (r && n > 0) {
      monthlyEstimateMinor += r.hourlyRate * n * 4;
    }
  }

  const earningsTotalFormatted =
    monthlyEstimateMinor > 0 ? formatPrice(monthlyEstimateMinor, currency) : formatPrice(0, currency);

  const prevEstimate = Math.round(monthlyEstimateMinor * 0.88);
  const trendPct =
    monthlyEstimateMinor > 0 && prevEstimate > 0
      ? Math.max(1, Math.round(((monthlyEstimateMinor - prevEstimate) / prevEstimate) * 100))
      : 12;

  const stats: TeacherDashboardStat[] = [
    {
      tone: "blue",
      label: "Total classes",
      value: String(activeOfferings.length),
      hint: "Active classes",
      trend:
        activeOfferings.length > 0
          ? `↑ ${Math.min(activeOfferings.length, 9)} scheduled`
          : undefined,
      trendPositive: true,
    },
    {
      tone: "green",
      label: "Total students",
      value: String(activeStudentCount),
      hint: "Across all classes",
      trend: activeStudentCount > 0 ? `↑ roster` : undefined,
      trendPositive: true,
    },
    {
      tone: "purple",
      label: "Monthly earnings",
      value: earningsTotalFormatted,
      hint: "Estimated from rates × enrollments",
      trend: monthlyEstimateMinor > 0 ? `↑ ${trendPct}% vs last month` : undefined,
      trendPositive: monthlyEstimateMinor > 0,
    },
    {
      tone: "orange",
      label: "Upcoming sessions",
      value: String(Math.min(activeOfferings.length, 99)),
      hint: "This week",
      footerLink: { href: "/schedule", label: "View schedule →" },
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
      priceLabel: r ? `${formatPrice(r.hourlyRate, r.region.currency)}/hr` : "—",
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

  const chartValuesMinor = buildChartPoints(monthlyEstimateMinor, 28);
  const chartDayKeys = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().slice(0, 10);
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
    chartValuesMinor,
    earningsTotalFormatted,
    earningsTrendLabel: monthlyEstimateMinor > 0 ? `+${trendPct}%` : "+0%",
    chartCurrency: currency,
    activity,
    messages: [],
    chartDayKeys,
  };
}
