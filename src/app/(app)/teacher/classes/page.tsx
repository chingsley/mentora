import type { Metadata } from "next";
import { TeacherClassesTableCard } from "@/components/features/teacher/dashboard/TeacherClassesTableCard";
import { AppPageHeader } from "@/components/layouts/AppPageHeader";
import { PageWrap } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { getTeacherClassRows } from "@/server/teacherClasses";
import { PrimaryLink } from "@/components/ui/Link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export const metadata: Metadata = { title: "My classes" };

export default async function TeacherMyClassesPage() {
  const session = await requireRole("TEACHER");
  const data = await getTeacherClassRows(session.user.id);

  if (!data) {
    return (
      <PageWrap>
        <AppPageHeader title="My classes" subtitle="We couldn't load your class roster." />
        <Card>
          <CardHeader>
            <CardTitle>Classes unavailable</CardTitle>
            <CardDescription>
              Try completing your teacher profile, then return to this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrimaryLink href="/profile">Go to profile</PrimaryLink>
          </CardContent>
        </Card>
      </PageWrap>
    );
  }

  const subtitle =
    data.rows.length > 0
      ? `${data.rows.length} active class period${data.rows.length === 1 ? "" : "s"} on your roster.`
      : "Add class periods on your schedule to start enrolling students.";

  return (
    <PageWrap>
      <AppPageHeader title="My classes" subtitle={subtitle} profileImage={data.teacherImage} />
      <TeacherClassesTableCard rows={data.rows} showScheduleLink />
    </PageWrap>
  );
}
