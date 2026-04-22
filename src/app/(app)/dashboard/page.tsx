import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { listStudentEnrollments } from "@/server/enrollments";
import { getMyTeacherProfile, listTeacherOfferings } from "@/server/teachers";
import { listLinkedStudents } from "@/server/guardians";
import { getPolicy } from "@/server/policies";
import { NotificationPermissionBanner } from "@/components/features/student/NotificationPermissionBanner";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();
  const { role, id: userId, name } = session.user;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">
          Welcome{name ? `, ${name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          You&apos;re signed in as <span className="font-medium">{role.toLowerCase()}</span>.
        </p>
      </div>

      {role === "STUDENT" ? <StudentDash userId={userId} /> : null}
      {role === "TEACHER" ? <TeacherDash userId={userId} /> : null}
      {role === "GUARDIAN" ? <GuardianDash userId={userId} /> : null}
      {role === "ADMIN" ? <AdminDash /> : null}
    </div>
  );
}

async function StudentDash({ userId }: { userId: string }) {
  const enrollments = await listStudentEnrollments(userId);
  return (
    <div className="flex flex-col gap-4">
      <NotificationPermissionBanner />
      <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Find a teacher</CardTitle>
          <CardDescription>
            Search by subject, price, and region to find the right fit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/teachers"
            className="inline-flex h-10 items-center justify-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
          >
            Browse teachers
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your active classes</CardTitle>
          <CardDescription>
            You are enrolled in {enrollments.length} period{enrollments.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/classes" className="text-sm font-medium text-header hover:underline">
            View my classes →
          </Link>
        </CardContent>
      </Card>
      </div>
    </div>
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
    <div className="grid gap-4 md:grid-cols-2">
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
          <Link
            href="/profile"
            className="inline-flex h-10 items-center justify-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
          >
            {profile?.profileCompleted ? "View my profile" : "Complete profile"}
          </Link>
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
          <Link
            href="/schedule"
            className="inline-flex h-10 items-center justify-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
          >
            Manage schedule
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

async function GuardianDash({ userId }: { userId: string }) {
  const links = await listLinkedStudents(userId);
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Linked students</CardTitle>
          <CardDescription>
            You have read-only access to {links.length} student record{links.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              A student needs to invite you via email. Ask them to add your email address from
              their guardians page.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {links.map((l) => (
                <li key={l.id} className="rounded-md border border-border p-3">
                  <p className="font-medium text-header">{l.studentProfile.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {l.studentProfile.enrollments.length} active class
                    {l.studentProfile.enrollments.length === 1 ? "" : "es"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function AdminDash() {
  const policy = await getPolicy();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Platform policy</CardTitle>
          <CardDescription>
            Global class cap: {policy.globalClassCap} &middot; Commission: {policy.commissionPercent}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/policies" className="text-sm font-medium text-header hover:underline">
            Manage policies →
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>View and manage accounts on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/users" className="text-sm font-medium text-header hover:underline">
            View users →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
