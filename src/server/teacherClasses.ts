import "server-only";

import { sessionLabel } from "@/lib/dashboardSchedule";
import { formatPrice } from "@/lib/time";
import type { TeacherDashboardClassRow } from "@/types/teacherDashboard";
import { getMyTeacherProfile } from "@/server/teachers";

export async function getTeacherClassRows(
  userId: string,
): Promise<{ rows: TeacherDashboardClassRow[]; teacherImage: string | null } | null> {
  const data = await getMyTeacherProfile(userId);
  if (!data) return null;

  const { profile } = data;
  const currency =
    profile.user.region?.currency ?? profile.rates[0]?.region.currency ?? "USD";

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

  return {
    rows,
    teacherImage: profile.user.image,
  };
}
