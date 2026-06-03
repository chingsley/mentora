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
import { AppPageHeader } from "@/components/layouts/AppPageHeader";
import { Muted, PageWrap } from "@/components/ui/primitives";
import { TeacherScheduleClient } from "./TeacherScheduleClient";
import { TodayAttendance, type TodayAttendanceSession } from "./TodayAttendance";
import { AssignmentsList } from "./AssignmentsList";
import { getMyTeacherProfile, listInviteableStudentsForTeacher } from "@/server/teachers";
import { getTeacherTodaySessions } from "@/server/attendance";
import { getPolicy } from "@/server/policies";

export const metadata: Metadata = { title: "My schedule" };

export default async function TeacherSchedulePage() {
  const session = await requireRole("TEACHER");
  const [data, policy, todayRaw, inviteableStudentRows] = await Promise.all([
    getMyTeacherProfile(session.user.id),
    getPolicy(),
    getTeacherTodaySessions(session.user.id),
    listInviteableStudentsForTeacher(session.user.id),
  ]);
  const todaySessions: TodayAttendanceSession[] = todayRaw.map((s) => ({
    offeringId: s.offeringId,
    offeringTitle: s.offeringTitle,
    subjectName: s.subjectName,
    startMinutes: s.startMinutes,
    endMinutes: s.endMinutes,
    sessionDate: s.sessionDate.toISOString(),
    inJoinWindow: s.inJoinWindow,
    sessionOutcome: s.sessionOutcome,
    notHeldReason: s.notHeldReason,
    teacherNote: s.teacherNote,
    studentNote: s.studentNote,
    students: s.students.map((stu) => ({
      enrollmentId: stu.enrollmentId,
      studentName: stu.studentName,
      status: stu.status,
      source: stu.source,
      teacherNote: stu.teacherNote,
      studentNote: stu.studentNote,
      joinedAt: stu.joinedAt?.toISOString() ?? null,
      changeLog: stu.changeLog,
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
    scheduleGroupId: o.scheduleGroupId ?? null,
    dayOfWeek: o.dayOfWeek,
    startMinutes: o.startMinutes,
    endMinutes: o.endMinutes,
    periodType: o.periodType,
    teacherCap: o.teacherCap ?? policy.globalClassCap,
    enrolled: o.enrollments.length,
    invitedStudentProfileIds: o.invites.map((i) => i.studentProfileId),
    recurrenceKind: o.recurrenceKind,
    recurrenceAnchorDate: o.recurrenceAnchorDate,
    recurrenceOrdinal: o.recurrenceOrdinal,
  }));

  const inviteableStudents = inviteableStudentRows.map((s) => ({
    id: s.id,
    name: s.user.name,
    email: s.user.email,
  }));

  const subjects = profile.subjects.map((s) => ({
    id: s.subjectId,
    name: s.subject.name,
    defaultCap: s.defaultCap ?? policy.globalClassCap,
  }));

  return (
    <PageWrap>
      <AppPageHeader
        title="My weekly schedule"
        subtitle={`Click an empty slot to add a class period. Admin cap: ${policy.globalClassCap}.`}
        profileImage={profile.user.image ?? null}
      />

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
                inviteableStudents={inviteableStudents}
                globalCap={policy.globalClassCap}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s attendance</CardTitle>
              <CardDescription>
                Override or review attendance for today&apos;s sessions. System
                marks present on join and absent after class ends; teacher
                overrides require a comment and are logged.
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
