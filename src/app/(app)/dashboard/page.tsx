import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { PrimaryLink, TextLink } from "@/components/ui/Link";
import {
  Grid,
  Muted,
  PageHeader,
  PageTitle,
  PageWrap,
  Stack,
  Strong,
} from "@/components/ui/primitives";
import { listStudentEnrollments } from "@/server/enrollments";
import { getMyTeacherProfile, listTeacherOfferings } from "@/server/teachers";
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
      <PageHeader>
        <PageTitle>Welcome{name ? `, ${name.split(" ")[0]}` : ""}</PageTitle>
        <Muted>
          You&apos;re signed in as <Strong>{role.toLowerCase()}</Strong>.
        </Muted>
      </PageHeader>

      {role === "STUDENT" ? <StudentDash userId={userId} /> : null}
      {role === "TEACHER" ? <TeacherDash userId={userId} /> : null}
      {role === "GUARDIAN" ? <GuardianDash userId={userId} /> : null}
      {role === "ADMIN" ? <AdminDash /> : null}
    </PageWrap>
  );
}

async function StudentDash({ userId }: { userId: string }) {
  const enrollments = await listStudentEnrollments(userId);
  return (
    <Stack $gap="FOUR">
      <NotificationPermissionBanner />
      <Grid $gap="FOUR" $mdCols={2}>
        <Card>
          <CardHeader>
            <CardTitle>Find a teacher</CardTitle>
            <CardDescription>
              Search by subject, price, and region to find the right fit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrimaryLink href="/teachers">Browse teachers</PrimaryLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your active classes</CardTitle>
            <CardDescription>
              You are enrolled in {enrollments.length} period
              {enrollments.length === 1 ? "" : "s"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TextLink href="/classes">View my classes →</TextLink>
          </CardContent>
        </Card>
      </Grid>
    </Stack>
  );
}

async function TeacherDash({ userId }: { userId: string }) {
  const [offerings, data] = await Promise.all([
    listTeacherOfferings(userId),
    getMyTeacherProfile(userId),
  ]);
  const profile = data?.profile ?? null;
  const activeStudents = data?.activeStudentCount ?? 0;
  return (
    <Grid $gap="FOUR" $mdCols={2}>
      <Card>
        <CardHeader>
          <CardTitle>My teacher profile</CardTitle>
          <CardDescription>
            {profile?.profileCompleted
              ? `You're all set. ID ${profile.displayId}.`
              : "Finish setting up to appear in student searches."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrimaryLink href="/profile">
            {profile?.profileCompleted ? "View my profile" : "Complete profile"}
          </PrimaryLink>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your weekly schedule</CardTitle>
          <CardDescription>
            {offerings.length} active period{offerings.length === 1 ? "" : "s"} &middot;{" "}
            {activeStudents} active student{activeStudents === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrimaryLink href="/schedule">Manage schedule</PrimaryLink>
        </CardContent>
      </Card>
    </Grid>
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
          <TextLink href="/admin/policies">Manage policies →</TextLink>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>View and manage accounts on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <TextLink href="/admin/users">View users →</TextLink>
        </CardContent>
      </Card>
    </Grid>
  );
}
