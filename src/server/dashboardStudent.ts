import "server-only";

import { formatPrice } from "@/lib/time";
import {
  daysAgo,
  formatDueLabel,
  formatTimeAmPm,
  nextOccurrenceParts,
  sessionLabel,
} from "@/lib/dashboardSchedule";
import { listAssignmentsForStudentUser } from "@/server/assignments";
import { listStudentEnrollments } from "@/server/enrollments";
import { rateForEnrollment } from "@/server/studentBill";
import { getMyStudentProfile } from "@/server/students";
import type {
  StudentDashboardAssignmentItem,
  StudentDashboardClassRow,
  StudentDashboardPayload,
  StudentDashboardStat,
  StudentDashboardUpcomingSession,
} from "@/types/studentDashboard";

export async function getStudentDashboardPayload(
  userId: string,
): Promise<StudentDashboardPayload | null> {
  const profile = await getMyStudentProfile(userId);
  if (!profile) return null;

  const [enrollments, assignments] = await Promise.all([
    listStudentEnrollments(userId),
    listAssignmentsForStudentUser(userId),
  ]);

  const teacherIds = new Set(enrollments.map((e) => e.offering.teacherProfile.user.id));
  const pendingAssignments = assignments.filter((a) => a.submissions.length === 0);
  const currency =
    profile.user.region?.currency ??
    enrollments[0]?.offering.teacherProfile.user.region?.currency ??
    enrollments[0]?.offering.teacherProfile.rates[0]?.region.currency ??
    "USD";

  let monthlyEstimateMinor = 0;
  for (const e of enrollments) {
    const rate = rateForEnrollment(e);
    if (rate) monthlyEstimateMinor += rate.hourlyRate * 4;
  }

  const spendFormatted =
    monthlyEstimateMinor > 0 ? formatPrice(monthlyEstimateMinor, currency) : formatPrice(0, currency);

  const stats: StudentDashboardStat[] = [
    {
      tone: "blue",
      label: "Active classes",
      value: String(enrollments.length),
      hint: "Enrolled periods",
      trend: enrollments.length > 0 ? `↑ on your roster` : undefined,
      trendPositive: enrollments.length > 0,
      footerLink: { href: "/classes", label: "View my classes →" },
    },
    {
      tone: "green",
      label: "My teachers",
      value: String(teacherIds.size),
      hint: "Across all subjects",
      trend: teacherIds.size > 0 ? `↑ learning with ${teacherIds.size}` : undefined,
      trendPositive: teacherIds.size > 0,
      footerLink: { href: "/teachers", label: "Find teachers →" },
    },
    {
      tone: "purple",
      label: "Pending work",
      value: String(pendingAssignments.length),
      hint: "Assignments not submitted",
      trend:
        pendingAssignments.length > 0
          ? `↑ ${pendingAssignments.length} to complete`
          : undefined,
      trendPositive: false,
    },
    {
      tone: "orange",
      label: "Est. monthly cost",
      value: spendFormatted,
      hint: "Based on enrolled class rates",
      trend: monthlyEstimateMinor > 0 ? `↑ 4 sessions / class` : undefined,
      trendPositive: monthlyEstimateMinor > 0,
    },
  ];

  const classes: StudentDashboardClassRow[] = enrollments.slice(0, 8).map((e) => {
    const o = e.offering;
    return {
      id: e.id,
      offeringId: o.id,
      subjectName: o.subject.name,
      title: o.title,
      teacherName: o.teacherProfile.user.name,
      sessionLabel: sessionLabel(o.dayOfWeek, o.startMinutes),
      status: "active",
    };
  });

  const upcomingSessions: StudentDashboardUpcomingSession[] = enrollments.slice(0, 6).map((e) => {
    const o = e.offering;
    const parts = nextOccurrenceParts(o.dayOfWeek, o.startMinutes);
    const titleShort = o.title.length > 52 ? `${o.title.slice(0, 52)}…` : o.title;
    return {
      id: e.id,
      monthShort: parts.monthShort,
      day: parts.day,
      subjectName: o.subject.name,
      subtitle: `${titleShort} · ${o.teacherProfile.user.name}`,
      timeRange: `${formatTimeAmPm(o.startMinutes)} – ${formatTimeAmPm(o.endMinutes)}`,
    };
  });

  const teacherByOffering = new Map(
    enrollments.map((e) => [e.offering.id, e.offering.teacherProfile.user.name]),
  );

  const assignmentItems: StudentDashboardAssignmentItem[] = pendingAssignments.slice(0, 5).map((a) => ({
    id: a.id,
    offeringId: a.offeringId,
    title: a.title,
    subjectName: a.offering.subject.name,
    teacherName: teacherByOffering.get(a.offeringId) ?? "Your teacher",
    dueLabel: formatDueLabel(a.dueAt),
    timeAgo: daysAgo(a.dueAt),
  }));

  return {
    studentName: profile.user.name,
    studentImage: profile.user.image,
    stats,
    classes,
    upcomingSessions,
    assignments: assignmentItems,
  };
}
