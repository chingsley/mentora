import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { computeCapacity } from "@/lib/capacity";
import { assertGuardianHasStudent } from "@/server/guardians";
import { listEnrollmentsByStudentProfileId } from "@/server/enrollments";
import { getPolicy } from "@/server/policies";
import { db } from "@/lib/db";
import type { CalendarEntry } from "@/components/features/calendar/types";
import { WardTimetable } from "./WardTimetable";

export const metadata: Metadata = { title: "Ward profile" };

interface Props {
  params: Promise<{ studentId: string }>;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase() || "?";
}

export default async function WardProfilePage({ params }: Props) {
  const session = await requireRole("GUARDIAN");
  const { studentId } = await params;
  await assertGuardianHasStudent(session.user.id, studentId);

  const [student, enrollments, policy] = await Promise.all([
    db.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        interests: { include: { subject: true } },
      },
    }),
    listEnrollmentsByStudentProfileId(studentId),
    getPolicy(),
  ]);

  if (!student) notFound();

  const entries: CalendarEntry[] = enrollments.map((e) => {
    const o = e.offering;
    const cap = computeCapacity({
      globalClassCap: policy.globalClassCap,
      teacherCap: o.teacherCap,
      currentEnrolled: o.enrollments.length,
    });
    return {
      id: e.id,
      offeringId: o.id,
      title: o.title,
      subtitle: o.subject.name,
      subjectId: o.subjectId,
      dayOfWeek: o.dayOfWeek,
      startMinutes: o.startMinutes,
      endMinutes: o.endMinutes,
      enrolled: o.enrollments.length,
      effectiveCap: cap.effectiveCap,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-header/10 sm:h-28 sm:w-28">
            {student.user.image ? (
              <Image
                src={student.user.image}
                alt={`${student.user.name} profile photo`}
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                {initials(student.user.name)}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <h1 className="text-2xl font-semibold text-header sm:text-3xl">{student.user.name}</h1>
            <p className="text-sm text-muted-foreground">{student.user.email}</p>
            <p className="text-sm text-text/80">
              {enrollments.length} active class{enrollments.length === 1 ? "" : "es"}
            </p>
            {student.interests.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {student.interests.map((i) => (
                  <span
                    key={i.subject.id}
                    className="rounded-full border border-border px-2 py-0.5 text-xs text-text/80"
                  >
                    {i.subject.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly timetable</CardTitle>
          <CardDescription>
            Tap a class for teacher details, attendance history, and join options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="rounded-md bg-background p-4 text-sm text-muted-foreground">
              {student.user.name.split(" ")[0]} isn&apos;t enrolled in any active classes yet.
            </p>
          ) : (
            <WardTimetable entries={entries} studentId={studentId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
