import type { Metadata } from "next";
import { TeacherMyClassesClient } from "@/components/features/teacher/dashboard/TeacherMyClassesClient";
import { AppPageHeader } from "@/components/layouts/AppPageHeader";
import { PageWrap } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth";
import { getTeacherClassesPageData } from "@/server/teacherClasses";
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
  const data = await getTeacherClassesPageData(session.user.id);

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
      <TeacherMyClassesClient
        rows={data.rows}
        subtitle={subtitle}
        profileImage={data.teacherImage}
        offeringDialog={data.offeringDialog}
      />
    </PageWrap>
  );
}
