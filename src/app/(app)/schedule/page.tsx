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
import { TeacherScheduleClient } from "./TeacherScheduleClient";
import { TodayAttendance, type TodayAttendanceSession } from "./TodayAttendance";
import { getMyTeacherProfile } from "@/server/teachers";
import { getTeacherTodaySessions } from "@/server/attendance";
import { getPolicy } from "@/server/policies";

export const metadata: Metadata = { title: "My schedule" };

export default async function TeacherSchedulePage() {
  const session = await requireRole("TEACHER");
  const [data, policy, todayRaw] = await Promise.all([
    getMyTeacherProfile(session.user.id),
    getPolicy(),
    getTeacherTodaySessions(session.user.id),
  ]);
  const todaySessions: TodayAttendanceSession[] = todayRaw.map((s) => ({
    offeringId: s.offeringId,
    offeringTitle: s.offeringTitle,
    subjectName: s.subjectName,
    startMinutes: s.startMinutes,
    endMinutes: s.endMinutes,
    sessionDate: s.sessionDate.toISOString(),
    inJoinWindow: s.inJoinWindow,
    students: s.students.map((stu) => ({
      enrollmentId: stu.enrollmentId,
      studentName: stu.studentName,
      status: stu.status,
      source: stu.source,
    })),
  }));
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
        <>
          <Card>
            <CardContent>
              <TeacherScheduleClient
                offerings={offerings}
                subjects={subjects}
                globalCap={policy.globalClassCap}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s attendance</CardTitle>
              <CardDescription>
                Override or mark attendance for today&apos;s sessions. Auto-join entries
                from students are preserved unless you change them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TodayAttendance sessions={todaySessions} />
            </CardContent>
          </Card>

          {offerings.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>
                  Post assignments and grade submissions for each class.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col divide-y divide-border">
                  {offerings.map((o) => (
                    <li
                      key={o.id}
                      className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-header">{o.title}</p>
                        <p className="text-xs text-muted-foreground">{o.subjectName}</p>
                      </div>
                      <Link
                        href={`/classes/${o.id}/assignments`}
                        className="inline-flex h-9 items-center rounded-md border border-border bg-foreground px-3 text-xs font-medium text-header hover:bg-header/[0.06]"
                      >
                        Manage assignments
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
