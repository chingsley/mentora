import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { StudentDashboardView } from "@/components/features/student/dashboard/StudentDashboardView";
import { TeacherDashboardView } from "@/components/features/teacher/dashboard/TeacherDashboardView";
import { PrimaryLink, TextLink } from "@/components/ui/Link";
import { AppPageHeader } from "@/components/layouts/AppPageHeader";
import { Grid, Muted, PageWrap, Stack } from "@/components/ui/primitives";
import { getStudentDashboardPayload } from "@/server/dashboardStudent";
import { getTeacherDashboardPayload } from "@/server/dashboardTeacher";
import { listLinkedStudents } from "@/server/guardians";
import { getPolicy } from "@/server/policies";
import { NotificationPermissionBanner } from "@/components/features/student/NotificationPermissionBanner";
import { GuardianWardCard, GuardianWardGrid } from "./GuardianWardCard";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();
  const { role, id: userId, name } = session.user;

  return (
    <PageWrap>
      {role !== "TEACHER" && role !== "STUDENT" ? (
        <AppPageHeader
          title={`Welcome${name ? `, ${name.split(" ")[0]}` : ""}`}
          subtitle={`You're signed in as ${role.toLowerCase()}.`}
        />
      ) : null}

      {role === "STUDENT" ? <StudentDash userId={userId} /> : null}
      {role === "TEACHER" ? <TeacherDash userId={userId} /> : null}
      {role === "GUARDIAN" ? <GuardianDash userId={userId} /> : null}
      {role === "ADMIN" ? <AdminDash /> : null}
    </PageWrap>
  );
}

async function StudentDash({ userId }: { userId: string }) {
  const data = await getStudentDashboardPayload(userId);
  if (!data) {
    return (
      <Grid $gap="FOUR" $mdCols={2}>
        <Card>
          <CardHeader>
            <CardTitle>Student dashboard</CardTitle>
            <CardDescription>
              We couldn&apos;t load your student profile. Try completing onboarding again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrimaryLink href="/profile">Go to profile</PrimaryLink>
          </CardContent>
        </Card>
      </Grid>
    );
  }
  const subtitle =
    data.classes.length > 0
      ? `You have ${data.classes.length} active class${data.classes.length === 1 ? "" : "es"} on your roster.`
      : "Browse teachers to enroll in your first class.";

  return (
    <>
      <AppPageHeader
        title="Student Dashboard"
        subtitle={subtitle}
        profileImage={data.studentImage}
      />
      <StudentDashboardView data={data} />
    </>
  );
}

async function TeacherDash({ userId }: { userId: string }) {
  const data = await getTeacherDashboardPayload(userId);
  if (!data) {
    return (
      <Grid $gap="FOUR" $mdCols={2}>
        <Card>
          <CardHeader>
            <CardTitle>Teacher dashboard</CardTitle>
            <CardDescription>
              We couldn&apos;t load your teacher profile. Try completing onboarding again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrimaryLink href="/profile">Go to profile</PrimaryLink>
          </CardContent>
        </Card>
      </Grid>
    );
  }
  return (
    <>
      <AppPageHeader
        title="Teacher Dashboard"
        subtitle="Your classes, schedule, and student activity at a glance."
        profileImage={data.teacherImage}
      />
      <TeacherDashboardView data={data} />
    </>
  );
}

async function GuardianDash({ userId }: { userId: string }) {
  const links = await listLinkedStudents(userId);
  return (
    <Stack $gap="FOUR">
      <NotificationPermissionBanner />
      <Card>
        <CardHeader>
          <CardTitle>My wards</CardTitle>
          <CardDescription>
            You have read-only access to {links.length} student record
            {links.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <Muted>
              A student needs to invite you. Ask them to send you an invite code from their
              guardians page.
            </Muted>
          ) : (
            <GuardianWardGrid>
              {links.map((l) => (
                <GuardianWardCard
                  key={l.id}
                  studentProfileId={l.studentProfile.id}
                  studentName={l.studentProfile.user.name}
                  enrollmentCount={l.studentProfile.enrollments.length}
                />
              ))}
            </GuardianWardGrid>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

async function AdminDash() {
  const policy = await getPolicy();
  return (
    <Grid $gap="FOUR" $mdCols={2}>
      <Card>
        <CardHeader>
          <CardTitle>Platform policy</CardTitle>
          <CardDescription>
            Global class cap: {policy.globalClassCap} &middot; Commission: {policy.commissionPercent}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TextLink href="/admin/policies">Manage policies</TextLink>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>View and manage accounts on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <TextLink href="/admin/users">View users</TextLink>
        </CardContent>
      </Card>
    </Grid>
  );
}
