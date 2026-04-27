import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { assertGuardianHasStudent } from "@/server/guardians";
import { db } from "@/lib/db";
import { getPolicy } from "@/server/policies";
import { computeCapacity } from "@/lib/capacity";
import { formatPrice, minutesToTime, DAY_LABEL } from "@/lib/time";
import {
  attendanceSummary,
  listAttendanceForEnrollment,
} from "@/server/attendance";
import { GuardianJoinObserverButton } from "./GuardianJoinObserverButton";
import { WardClassDetailView } from "./WardClassDetailView";

export const metadata: Metadata = { title: "Class details" };

interface Props {
  params: Promise<{ studentId: string; offeringId: string }>;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase() || "?";
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export default async function WardClassDetailPage({ params }: Props) {
  const session = await requireRole("GUARDIAN");
  const { studentId, offeringId } = await params;
  await assertGuardianHasStudent(session.user.id, studentId);

  const [enrollment, policy] = await Promise.all([
    db.enrollment.findFirst({
      where: { studentProfileId: studentId, offeringId, status: "ACTIVE" },
      include: {
        offering: {
          include: {
            subject: true,
            teacherProfile: {
              include: {
                user: {
                  select: { id: true, name: true, image: true, region: true },
                },
                rates: { include: { region: true } },
                subjects: { include: { subject: true } },
              },
            },
            enrollments: { where: { status: "ACTIVE" }, select: { id: true } },
          },
        },
      },
    }),
    getPolicy(),
  ]);
  if (!enrollment) notFound();

  const o = enrollment.offering;
  const teacher = o.teacherProfile;
  const cap = computeCapacity({
    globalClassCap: policy.globalClassCap,
    teacherCap: o.teacherCap,
    currentEnrolled: o.enrollments.length,
  });
  const rate =
    teacher.rates.find((r) => r.subjectId === o.subjectId) ??
    teacher.rates[0] ??
    null;
  const durationMinutes = o.endMinutes - o.startMinutes;
  const hourlyDisplay = rate
    ? formatPrice(rate.hourlyRate, rate.region.currency)
    : null;
  const [attendance, summary] = await Promise.all([
    listAttendanceForEnrollment(enrollment.id),
    attendanceSummary(enrollment.id),
  ]);

  const summaryLine =
    summary.total === 0
      ? "No sessions recorded yet."
      : `${summary.attendedPct}% attended · ${summary.present} present · ${summary.late} late · ${summary.absent} absent · ${summary.excused} excused`;

  const rulesLines = o.rules.trim()
    ? o.rules.split("\n").map((l) => l.trim()).filter(Boolean)
    : [];

  return (
    <WardClassDetailView
      studentId={studentId}
      offering={{
        title: o.title,
        subjectName: o.subject.name,
        dayLabel: DAY_LABEL[o.dayOfWeek],
        timeLabel: `${minutesToTime(o.startMinutes)}–${minutesToTime(o.endMinutes)}`,
        durationLabel: formatDuration(durationMinutes),
        hourlyDisplay,
        classLimit: cap.effectiveCap,
        enrolledCount: o.enrollments.length,
        description: o.description,
        rulesLines,
      }}
      teacher={{
        id: teacher.id,
        name: teacher.user.name,
        imageUrl: teacher.user.image,
        initials: initials(teacher.user.name),
        avgRating: teacher.avgRating,
        ratingsCount: teacher.ratingsCount,
      }}
      attendance={attendance.map((row) => ({
        id: row.id,
        sessionDate: row.sessionDate,
        source: row.source,
        status: row.status,
      }))}
      attendanceSummary={{
        total: summary.total,
        summaryLine,
      }}
      joinObserverButton={
        <GuardianJoinObserverButton
          enrollmentId={enrollment.id}
          offeringTitle={o.title}
          studentName={session.user.name ?? "Guardian"}
          dayOfWeek={o.dayOfWeek}
          startMinutes={o.startMinutes}
          endMinutes={o.endMinutes}
        />
      }
    />
  );
}
