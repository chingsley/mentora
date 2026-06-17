import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AppPageHeader } from "@/components/layouts/AppPageHeader";
import { Muted, PageWrap } from "@/components/ui/primitives";
import { getStudentClassCalendarData } from "@/server/studentClassCalendar";
import { StudentClassesClient } from "./StudentClassesClient";
import { NotificationPermissionBanner } from "@/components/features/student/NotificationPermissionBanner";

export const metadata: Metadata = { title: "My classes" };

export default async function MyClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const session = await requireRole("STUDENT");
  const { rows, occurrenceMap } = await getStudentClassCalendarData(session.user.id);
  const sp = await searchParams;
  const initialClassId = typeof sp.class === "string" ? sp.class : null;

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
          initialClassId={initialClassId}
        />
      )}
    </PageWrap>
  );
}
