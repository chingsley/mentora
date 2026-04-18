import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { WeeklyScheduleCalendar } from "@/components/features/teacher/WeeklyScheduleCalendar";
import { getMyTeacherProfile } from "@/server/teachers";
import { getPolicy } from "@/server/policies";

export const metadata: Metadata = { title: "My schedule" };

export default async function TeacherSchedulePage() {
  const session = await requireRole("TEACHER");
  const [data, policy] = await Promise.all([
    getMyTeacherProfile(session.user.id),
    getPolicy(),
  ]);
  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Set up your teacher profile first.
      </p>
    );
  }

  const { profile } = data;
  const offerings = profile.offerings.map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    subjectId: o.subjectId,
    subjectName: o.subject.name,
    dayOfWeek: o.dayOfWeek,
    startMinutes: o.startMinutes,
    endMinutes: o.endMinutes,
    teacherCap: o.teacherCap,
    enrolled: o.enrollments.length,
  }));

  const subjects = profile.subjects.map((s) => ({
    id: s.subjectId,
    name: s.subject.name,
    defaultCap: s.defaultCap ?? Math.min(10, policy.globalClassCap),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">My weekly schedule</h1>
        <p className="text-sm text-muted-foreground">
          Click an empty slot to add a class period. Admin cap: <strong>{policy.globalClassCap}</strong>.
        </p>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Add your subjects first</CardTitle>
            <CardDescription>
              You need to pick the subjects you teach before you can schedule classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/profile"
              className="inline-flex h-10 items-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
            >
              Go to profile setup
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <WeeklyScheduleCalendar
              offerings={offerings}
              subjects={subjects}
              globalCap={policy.globalClassCap}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
