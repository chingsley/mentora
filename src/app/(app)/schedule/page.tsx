import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { PrimaryLink } from "@/components/ui/Link";
import { Muted, PageHeader, PageTitle, PageWrap, Strong } from "@/components/ui/primitives";
import { TeacherScheduleClient } from "./TeacherScheduleClient";
import { TodayAttendance, type TodayAttendanceSession } from "./TodayAttendance";
import { AssignmentsList } from "./AssignmentsList";
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
    return <Muted>Set up your teacher profile first.</Muted>;
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
    <PageWrap>
      <PageHeader>
        <PageTitle>My weekly schedule</PageTitle>
        <Muted>
          Click an empty slot to add a class period. Admin cap:{" "}
          <Strong>{policy.globalClassCap}</Strong>.
        </Muted>
      </PageHeader>

      {subjects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Add your subjects first</CardTitle>
            <CardDescription>
              You need to pick the subjects you teach before you can schedule
              classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrimaryLink href="/profile">Go to profile setup</PrimaryLink>
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
                Override or mark attendance for today&apos;s sessions. Auto-join
                entries from students are preserved unless you change them.
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
                <AssignmentsList
                  offerings={offerings.map((o) => ({
                    id: o.id,
                    title: o.title,
                    subjectName: o.subjectName,
                  }))}
                />
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </PageWrap>
  );
}
