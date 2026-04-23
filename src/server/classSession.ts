import "server-only";
import { db } from "@/lib/db";
import { recordAutoJoin, resolveCurrentSessionDate } from "./attendance";

export interface JoinClassSessionArgs {
  enrollmentId: string;
  actorUserId: string;
  /** True when the joiner is a guardian observing (no attendance recorded). */
  observer?: boolean;
}

export interface JoinClassSessionResult {
  ok: true;
  sessionUrl: string | null;
  attendanceId: string | null;
}

/**
 * Dedicated join function for a class session. Currently simulates the video
 * call by logging. When joining as the student (not observer), upserts an
 * Attendance row.
 */
export async function joinClassSession(
  args: JoinClassSessionArgs,
): Promise<JoinClassSessionResult> {
  const enrollment = await db.enrollment.findUnique({
    where: { id: args.enrollmentId },
    include: {
      studentProfile: { include: { user: { select: { id: true, name: true } } } },
      offering: { select: { id: true, title: true, dayOfWeek: true, startMinutes: true } },
    },
  });
  if (!enrollment) throw new Error("Enrollment not found");

  const studentName = enrollment.studentProfile.user.name;
  const prefix = args.observer ? "[observer]" : "";
  const iso = new Date().toISOString();

  // eslint-disable-next-line no-console
  console.log(
    `${prefix}student ${studentName} joined class session ${enrollment.offering.id} (${enrollment.offering.title}) at ${iso}`.trim(),
  );

  let attendanceId: string | null = null;
  if (!args.observer && enrollment.studentProfile.user.id === args.actorUserId) {
    const sessionDate = resolveCurrentSessionDate({
      dayOfWeek: enrollment.offering.dayOfWeek,
      startMinutes: enrollment.offering.startMinutes,
    });
    if (sessionDate) {
      const record = await recordAutoJoin({
        enrollmentId: enrollment.id,
        sessionDate,
      });
      attendanceId = record.id;
    }
  }

  return { ok: true, sessionUrl: null, attendanceId };
}
