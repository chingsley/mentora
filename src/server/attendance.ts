import "server-only";
import { z } from "zod";
import type { AttendanceStatus, AttendanceSource } from "@prisma/client";
import { db } from "@/lib/db";
import { nextOccurrence } from "@/lib/recurrence";

const JOIN_WINDOW_BEFORE_MS = 15 * 60 * 1000;
const LATE_AFTER_MS = 5 * 60 * 1000;

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  sessionDate: Date;
  status: AttendanceStatus;
  source: AttendanceSource;
  joinedAt: Date | null;
}

/**
 * Normalize an occurrence timestamp to a stable key. All attendance rows for
 * the same session share the same `sessionDate`, so we round to minute.
 */
function keyForOccurrence(occurrence: Date): Date {
  const d = new Date(occurrence);
  d.setSeconds(0, 0);
  return d;
}

export function resolveCurrentSessionDate(args: {
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  startMinutes: number;
  now?: Date;
}): Date | null {
  const now = args.now ?? new Date();
  const lookback = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const occurrence = nextOccurrence(args.dayOfWeek, args.startMinutes, lookback);
  const diff = occurrence.getTime() - now.getTime();
  if (diff > JOIN_WINDOW_BEFORE_MS) return null;
  if (now.getTime() - occurrence.getTime() > 3 * 60 * 60 * 1000) return null;
  return keyForOccurrence(occurrence);
}

export async function listAttendanceForEnrollment(enrollmentId: string) {
  return db.attendance.findMany({
    where: { enrollmentId },
    orderBy: { sessionDate: "desc" },
    take: 100,
  });
}

export async function listAttendanceForOffering(offeringId: string) {
  return db.attendance.findMany({
    where: { enrollment: { offeringId } },
    include: {
      enrollment: {
        include: {
          studentProfile: { include: { user: { select: { id: true, name: true } } } },
        },
      },
    },
    orderBy: { sessionDate: "desc" },
  });
}

/**
 * Upsert an attendance row when a student joins a class session. Returns the
 * row for display/logging. Status is `PRESENT` if the student joined within
 * the first 5 minutes, `LATE` afterwards.
 */
export async function recordAutoJoin(args: {
  enrollmentId: string;
  sessionDate: Date;
  joinedAt?: Date;
}) {
  const joinedAt = args.joinedAt ?? new Date();
  const lateMs = joinedAt.getTime() - args.sessionDate.getTime();
  const status: AttendanceStatus = lateMs > LATE_AFTER_MS ? "LATE" : "PRESENT";

  return db.attendance.upsert({
    where: {
      enrollmentId_sessionDate: {
        enrollmentId: args.enrollmentId,
        sessionDate: args.sessionDate,
      },
    },
    create: {
      enrollmentId: args.enrollmentId,
      sessionDate: args.sessionDate,
      status,
      source: "AUTO_JOIN",
      joinedAt,
    },
    update: {
      joinedAt,
      // Only upgrade to PRESENT from AUTO_JOIN; teacher overrides are sticky.
      status:
        status === "PRESENT"
          ? { set: "PRESENT" }
          : undefined,
      source: { set: "AUTO_JOIN" },
    },
  });
}

export const markAttendanceSchema = z.object({
  enrollmentId: z.string().cuid(),
  sessionDate: z.string().datetime(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;

/**
 * Teacher override. Verifies the teacher owns the offering attached to the
 * enrollment before writing the record.
 */
export async function markAttendance(
  teacherUserId: string,
  input: MarkAttendanceInput,
) {
  const enrollment = await db.enrollment.findUnique({
    where: { id: input.enrollmentId },
    include: {
      offering: {
        include: {
          teacherProfile: { select: { userId: true } },
        },
      },
    },
  });
  if (!enrollment) throw new Error("Enrollment not found");
  if (enrollment.offering.teacherProfile.userId !== teacherUserId) {
    throw new Error("Forbidden: you do not teach this class");
  }

  const sessionDate = keyForOccurrence(new Date(input.sessionDate));

  return db.attendance.upsert({
    where: {
      enrollmentId_sessionDate: {
        enrollmentId: input.enrollmentId,
        sessionDate,
      },
    },
    create: {
      enrollmentId: input.enrollmentId,
      sessionDate,
      status: input.status,
      source: "TEACHER",
      markedByUserId: teacherUserId,
    },
    update: {
      status: input.status,
      source: "TEACHER",
      markedByUserId: teacherUserId,
    },
  });
}

/**
 * Returns offerings that happen today for a teacher, plus their enrolled
 * students and any existing attendance row for today's session.
 */
export async function getTeacherTodaySessions(teacherUserId: string) {
  const teacher = await db.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    select: { id: true },
  });
  if (!teacher) return [];

  const now = new Date();
  const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
  const today = DAYS[now.getDay()];

  const offerings = await db.classOffering.findMany({
    where: { teacherProfileId: teacher.id, dayOfWeek: today },
    include: {
      subject: true,
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          studentProfile: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
    },
    orderBy: { startMinutes: "asc" },
  });

  return Promise.all(
    offerings.map(async (o) => {
      const sessionDate = resolveCurrentSessionDate({
        dayOfWeek: o.dayOfWeek,
        startMinutes: o.startMinutes,
        now,
      });
      const attendanceRows = sessionDate
        ? await db.attendance.findMany({
            where: {
              sessionDate,
              enrollmentId: { in: o.enrollments.map((e) => e.id) },
            },
          })
        : [];
      const byEnrollment = new Map(attendanceRows.map((r) => [r.enrollmentId, r]));
      // Fallback: derive a nominal session date even when outside the join
      // window, so teachers can correct earlier sessions.
      const nominalDate =
        sessionDate ??
        keyForOccurrence(nextOccurrence(o.dayOfWeek, o.startMinutes, new Date(now.getTime() - 3 * 60 * 60 * 1000)));
      return {
        offeringId: o.id,
        offeringTitle: o.title,
        subjectName: o.subject.name,
        startMinutes: o.startMinutes,
        endMinutes: o.endMinutes,
        sessionDate: nominalDate,
        inJoinWindow: Boolean(sessionDate),
        students: o.enrollments.map((e) => ({
          enrollmentId: e.id,
          studentName: e.studentProfile.user.name,
          status: byEnrollment.get(e.id)?.status ?? null,
          source: byEnrollment.get(e.id)?.source ?? null,
        })),
      };
    }),
  );
}

export async function attendanceSummary(enrollmentId: string) {
  const rows = await db.attendance.findMany({
    where: { enrollmentId },
    select: { status: true },
  });
  let present = 0;
  let absent = 0;
  let late = 0;
  let excused = 0;
  for (const r of rows) {
    if (r.status === "PRESENT") present++;
    else if (r.status === "ABSENT") absent++;
    else if (r.status === "LATE") late++;
    else excused++;
  }
  const total = rows.length;
  const attendedPct =
    total === 0 ? 0 : Math.round(((present + late) / total) * 100);
  return { total, present, absent, late, excused, attendedPct };
}
