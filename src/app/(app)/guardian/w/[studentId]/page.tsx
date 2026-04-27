import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { computeCapacity } from "@/lib/capacity";
import { assertGuardianHasStudent } from "@/server/guardians";
import { listEnrollmentsByStudentProfileId } from "@/server/enrollments";
import { getPolicy } from "@/server/policies";
import { db } from "@/lib/db";
import type { CalendarEntry } from "@/components/features/calendar/types";
import { WardProfileView } from "./WardProfileView";

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
    <WardProfileView
      studentId={studentId}
      studentName={student.user.name}
      studentEmail={student.user.email}
      imageUrl={student.user.image ?? null}
      initials={initials(student.user.name)}
      enrollmentsCount={enrollments.length}
      interests={student.interests.map((i) => ({
        id: i.subject.id,
        name: i.subject.name,
      }))}
      entries={entries}
    />
  );
}
