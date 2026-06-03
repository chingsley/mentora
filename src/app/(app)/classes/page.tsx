import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AppPageHeader } from "@/components/layouts/AppPageHeader";
import { Muted, PageWrap } from "@/components/ui/primitives";
import { offeringCapacity } from "@/lib/offeringCapacity";
import { DEFAULT_OFFERING_RECURRENCE, recurrenceFromDb } from "@/lib/offeringRecurrence";
import { listStudentEnrollments } from "@/server/enrollments";
import { finalizeOfferingPastSessions } from "@/server/attendance";
import { listStudentOccurrenceMap } from "@/server/sessionOccurrence";
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
    const capacity = offeringCapacity({
      periodType: o.periodType,
      globalClassCap: policy.globalClassCap,
      teacherCap: o.teacherCap,
      inviteCount: o.invites.length,
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
      recurrence: recurrenceFromDb({
        recurrenceKind: o.recurrenceKind,
        recurrenceAnchorDate: o.recurrenceAnchorDate,
        recurrenceOrdinal: o.recurrenceOrdinal,
      }),
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
      periodType: o.periodType,
      hourlyRate: rate
        ? { amount: rate.hourlyRate, currency: rate.region.currency }
        : null,
      rules: o.rules,
      description: o.description,
      recurrence: recurrenceFromDb({
        recurrenceKind: o.recurrenceKind,
        recurrenceAnchorDate: o.recurrenceAnchorDate,
        recurrenceOrdinal: o.recurrenceOrdinal,
      }),
    };

    return {
      enrollmentId: e.id,
      entry,
      detail,
      teacherName: o.teacherProfile.user.name,
    };
  });

  const offeringsToFinalize = new Map<
    string,
    {
      offeringId: string;
      endMinutes: number;
      dayOfWeek: (typeof rows)[number]["entry"]["dayOfWeek"];
      startMinutes: number;
      recurrence: ReturnType<typeof recurrenceFromDb>;
    }
  >();
  for (const row of rows) {
    if (!offeringsToFinalize.has(row.entry.offeringId)) {
      offeringsToFinalize.set(row.entry.offeringId, {
        offeringId: row.entry.offeringId,
        endMinutes: row.entry.endMinutes,
        dayOfWeek: row.entry.dayOfWeek,
        startMinutes: row.entry.startMinutes,
        recurrence: row.entry.recurrence ?? DEFAULT_OFFERING_RECURRENCE,
      });
    }
  }
  await Promise.all(
    [...offeringsToFinalize.values()].map((o) =>
      finalizeOfferingPastSessions({
        offeringId: o.offeringId,
        endMinutes: o.endMinutes,
        dayOfWeek: o.dayOfWeek,
        startMinutes: o.startMinutes,
        recurrence: o.recurrence,
      }),
    ),
  );

  const occurrenceMap = await listStudentOccurrenceMap({
    enrollments: rows.map((r) => ({
      enrollmentId: r.enrollmentId,
      offeringId: r.entry.offeringId,
      startMinutes: r.entry.startMinutes,
      endMinutes: r.entry.endMinutes,
    })),
  });

  return (
    <PageWrap>
      <AppPageHeader
        title="My classes"
        subtitle="Your weekly timetable — tap a class for details, to drop, or to join when it's live."
      />

      <NotificationPermissionBanner />

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No active classes</CardTitle>
          </CardHeader>
          <CardContent>
            <Muted>
              Head over to the <strong>Find teachers</strong> page to discover
              classes that fit your schedule.
            </Muted>
          </CardContent>
        </Card>
      ) : (
        <StudentClassesClient
          rows={rows}
          occurrenceMap={occurrenceMap}
          studentDisplayName={session.user.name ?? "You"}
        />
      )}
    </PageWrap>
  );
}
