import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { computeCapacity } from "@/lib/capacity";
import { listStudentEnrollments } from "@/server/enrollments";
import { getPolicy } from "@/server/policies";
import type { CalendarEntry } from "@/components/features/calendar/types";
import type { ClassDetail } from "@/components/features/class/ClassDetailsDialog";
import {
  StudentClassesClient,
  type StudentClassRow,
} from "./StudentClassesClient";
import { NotificationPermissionBanner } from "@/components/features/student/NotificationPermissionBanner";

export const metadata: Metadata = { title: "My classes" };

export default async function MyClassesPage() {
  const session = await requireRole("STUDENT");
  const [enrollments, policy] = await Promise.all([
    listStudentEnrollments(session.user.id),
    getPolicy(),
  ]);

  const rows: StudentClassRow[] = enrollments.map((e) => {
    const o = e.offering;
    const capacity = computeCapacity({
      globalClassCap: policy.globalClassCap,
      teacherCap: o.teacherCap,
      currentEnrolled: o.enrollments.length,
    });
    const rate =
      o.teacherProfile.rates.find((r) => r.subjectId === o.subjectId) ??
      o.teacherProfile.rates[0] ??
      null;

    const entry: CalendarEntry = {
      id: e.id,
      offeringId: o.id,
      title: o.title,
      subtitle: o.subject.name,
      subjectId: o.subjectId,
      dayOfWeek: o.dayOfWeek,
      startMinutes: o.startMinutes,
      endMinutes: o.endMinutes,
      enrolled: o.enrollments.length,
      effectiveCap: capacity.effectiveCap,
    };

    const detail: ClassDetail = {
      offeringId: o.id,
      title: o.title,
      subjectName: o.subject.name,
      teacherName: o.teacherProfile.user.name,
      dayOfWeek: o.dayOfWeek,
      startMinutes: o.startMinutes,
      endMinutes: o.endMinutes,
      effectiveCap: capacity.effectiveCap,
      enrolled: o.enrollments.length,
      hourlyRate: rate
        ? { amount: rate.hourlyRate, currency: rate.region.currency }
        : null,
      rules: o.rules,
      description: o.description,
      testimonials: o.testimonials.map((t) => ({
        id: t.id,
        rating: t.rating,
        body: t.body,
        createdAt: t.createdAt,
        studentName: t.studentProfile.user.name,
      })),
    };

    return {
      enrollmentId: e.id,
      entry,
      detail,
      teacherName: o.teacherProfile.user.name,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">My classes</h1>
        <p className="text-sm text-muted-foreground">
          Your weekly timetable — tap a class for details, to drop, or to join
          when it&apos;s live.
        </p>
      </div>

      <NotificationPermissionBanner />

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No active classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Head over to the <strong>Find teachers</strong> page to discover
              classes that fit your schedule.
            </p>
          </CardContent>
        </Card>
      ) : (
        <StudentClassesClient rows={rows} viewerName={session.user.name ?? null} />
      )}
    </div>
  );
}
