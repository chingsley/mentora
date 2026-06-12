import "server-only";

import { sessionLabel } from "@/lib/dashboardSchedule";
import { formatPrice } from "@/lib/time";
import { smallestToMajor } from "@/lib/money";
import type { TeacherDashboardClassRow } from "@/types/teacherDashboard";
import { getPolicy, listRegions } from "@/server/policies";
import { getMyTeacherProfile, listInviteableStudentsForTeacher } from "@/server/teachers";

export interface TeacherClassesOfferingDialogContext {
  subjects: { id: string; name: string; defaultCap: number }[];
  inviteableStudents: { id: string; name: string; email: string }[];
  globalCap: number;
  billingCurrency: string;
  regionMinHourlyMajor: number | null;
}

export interface TeacherClassesPageData {
  rows: TeacherDashboardClassRow[];
  teacherImage: string | null;
  offeringDialog: TeacherClassesOfferingDialogContext;
}

export async function getTeacherClassesPageData(
  userId: string,
): Promise<TeacherClassesPageData | null> {
  const [data, policy, inviteableStudentRows, regions] = await Promise.all([
    getMyTeacherProfile(userId),
    getPolicy(),
    listInviteableStudentsForTeacher(userId),
    listRegions(),
  ]);
  if (!data) return null;

  const { profile } = data;
  const currency =
    profile.user.region?.currency ?? profile.rates[0]?.region.currency ?? "USD";
  const teacherRegionCode = profile.user.region?.code ?? null;
  const regionMinHourlyMajor =
    teacherRegionCode != null
      ? (() => {
          const region = regions.find((r) => r.code === teacherRegionCode);
          return region?.minRates[0]
            ? smallestToMajor(region.minRates[0].hourlyRate, region.currency)
            : null;
        })()
      : null;

  const activeOfferings = profile.offerings.filter((o) => o.active);

  const rows: TeacherDashboardClassRow[] = activeOfferings.map((o) => ({
    id: o.id,
    subjectName: o.subject.name,
    title: o.title,
    studentCount: o.enrollments.length,
    sessionLabel: sessionLabel(o.dayOfWeek, o.startMinutes),
    priceLabel: o.hourlyRate > 0 ? `${formatPrice(o.hourlyRate, currency)}/session` : "—",
    status: "active",
  }));

  const subjects = profile.subjects.map((s) => ({
    id: s.subjectId,
    name: s.subject.name,
    defaultCap: s.defaultCap ?? policy.globalClassCap,
  }));

  const inviteableStudents = inviteableStudentRows.map((s) => ({
    id: s.id,
    name: s.user.name ?? "",
    email: s.user.email ?? "",
  }));

  return {
    rows,
    teacherImage: profile.user.image,
    offeringDialog: {
      subjects,
      inviteableStudents,
      globalCap: policy.globalClassCap,
      billingCurrency: currency,
      regionMinHourlyMajor,
    },
  };
}
