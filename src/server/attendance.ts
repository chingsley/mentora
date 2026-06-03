import "server-only";
import { z } from "zod";
import type { AttendanceSource, AttendanceStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { nextOccurrence } from "@/lib/recurrence";
import {
  DEFAULT_OFFERING_RECURRENCE,
  offeringOccursOnDate,
  recurrenceFromDb,
  type OfferingRecurrence,
} from "@/lib/offeringRecurrence";
import {
  keyForOccurrence,
  parseAttendanceSessionDateKey,
  sessionDateFromCalendarDate,
} from "@/lib/sessionOccurrenceKey";
import {
  ATTENDANCE_SYSTEM_COMMENT,
  SESSION_ATTENDANCE_EARLY_MS,
} from "@/constants/attendance.constants";
import {
  ATTENDANCE_NOT_YET_AVAILABLE_MESSAGE,
  canTakeSessionAttendanceForOccurrence,
  isSessionInScheduledWindow,
} from "@/lib/sessionAttendance";

const JOIN_WINDOW_BEFORE_MS = SESSION_ATTENDANCE_EARLY_MS;
const LATE_AFTER_MS = 5 * 60 * 1000;

type DbClient = Prisma.TransactionClient | typeof db;

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  sessionDate: Date;
  status: AttendanceStatus;
  source: AttendanceSource;
  joinedAt: Date | null;
}

export interface AttendanceChangeLogEntry {
  id: string;
  previousStatus: AttendanceStatus | null;
  newStatus: AttendanceStatus;
  source: AttendanceSource;
  changedByName: string | null;
  comment: string;
  createdAt: Date;
}

export function resolveCurrentSessionDate(args: {
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  startMinutes: number;
  recurrence?: OfferingRecurrence;
  now?: Date;
}): Date | null {
  const now = args.now ?? new Date();
  const recurrence = args.recurrence ?? DEFAULT_OFFERING_RECURRENCE;
  if (!offeringOccursOnDate(recurrence, args.dayOfWeek, now)) return null;

  const lookback = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const occurrence = nextOccurrence(args.dayOfWeek, args.startMinutes, lookback, recurrence);
  const diff = occurrence.getTime() - now.getTime();
  if (diff > JOIN_WINDOW_BEFORE_MS) return null;
  if (now.getTime() - occurrence.getTime() > 3 * 60 * 60 * 1000) return null;
  return keyForOccurrence(occurrence);
}

function sessionHasEnded(sessionDate: Date, endMinutes: number, now = new Date()) {
  const end = sessionDateFromCalendarDate(sessionDate, endMinutes);
  return now.getTime() > end.getTime();
}

async function appendChangeLog(
  client: DbClient,
  args: {
    attendanceId: string;
    previousStatus: AttendanceStatus | null;
    newStatus: AttendanceStatus;
    source: AttendanceSource;
    changedByUserId?: string | null;
    comment: string;
  },
) {
  return client.attendanceChangeLog.create({
    data: {
      attendanceId: args.attendanceId,
      previousStatus: args.previousStatus,
      newStatus: args.newStatus,
      source: args.source,
      changedByUserId: args.changedByUserId ?? null,
      comment: args.comment,
    },
  });
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
 * Marks enrolled students absent when a session has ended and no attendance
 * row exists yet. Skips sessions marked as not held.
 */
export async function finalizeSessionAttendance(args: {
  offeringId: string;
  sessionDate: Date;
  endMinutes: number;
  now?: Date;
}) {
  const now = args.now ?? new Date();
  const sessionDate = keyForOccurrence(args.sessionDate);
  if (!sessionHasEnded(sessionDate, args.endMinutes, now)) return;

  const occurrence = await db.sessionOccurrence.findUnique({
    where: {
      offeringId_sessionDate: {
        offeringId: args.offeringId,
        sessionDate,
      },
    },
  });
  if (occurrence?.outcome === "NOT_HELD") return;

  const enrollments = await db.enrollment.findMany({
    where: { offeringId: args.offeringId, status: "ACTIVE" },
    select: { id: true },
  });

  try {
    await db.$transaction(async (tx) => {
      for (const enrollment of enrollments) {
        const existing = await tx.attendance.findUnique({
          where: {
            enrollmentId_sessionDate: {
              enrollmentId: enrollment.id,
              sessionDate,
            },
          },
        });
        if (existing) continue;

        const row = await tx.attendance.create({
          data: {
            enrollmentId: enrollment.id,
            sessionDate,
            status: "ABSENT",
            source: "SYSTEM",
          },
        });

        await appendChangeLog(tx, {
          attendanceId: row.id,
          previousStatus: null,
          newStatus: "ABSENT",
          source: "SYSTEM",
          comment: ATTENDANCE_SYSTEM_COMMENT.STUDENT_DID_NOT_ATTEND,
        });
      }

      if (!occurrence) {
        await tx.sessionOccurrence.create({
          data: {
            offeringId: args.offeringId,
            sessionDate,
            outcome: "HELD",
          },
        });
      }
    });
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: unknown }).code)
        : "";
    if (code !== "P2021" && code !== "P2022") throw err;
  }
}

/** Finalizes attendance for all past sessions of an offering within a lookback window. */
export async function finalizeOfferingPastSessions(args: {
  offeringId: string;
  endMinutes: number;
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  startMinutes: number;
  recurrence: OfferingRecurrence;
  now?: Date;
  lookbackWeeks?: number;
}) {
  const now = args.now ?? new Date();
  const lookbackWeeks = args.lookbackWeeks ?? 12;
  const cursor = new Date(now);
  cursor.setDate(cursor.getDate() - lookbackWeeks * 7);
  cursor.setHours(0, 0, 0, 0);

  while (cursor.getTime() <= now.getTime()) {
    if (
      offeringOccursOnDate(args.recurrence, args.dayOfWeek, cursor) &&
      cursor.getDay() ===
        ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].indexOf(args.dayOfWeek)
    ) {
      const sessionDate = sessionDateFromCalendarDate(cursor, args.startMinutes);
      if (sessionHasEnded(sessionDate, args.endMinutes, now)) {
        await finalizeSessionAttendance({
          offeringId: args.offeringId,
          sessionDate,
          endMinutes: args.endMinutes,
          now,
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
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
  const sessionDate = keyForOccurrence(args.sessionDate);
  const joinedAt = args.joinedAt ?? new Date();
  const lateMs = joinedAt.getTime() - sessionDate.getTime();
  const status: AttendanceStatus = lateMs > LATE_AFTER_MS ? "LATE" : "PRESENT";

  return db.$transaction(async (tx) => {
    const existing = await tx.attendance.findUnique({
      where: {
        enrollmentId_sessionDate: {
          enrollmentId: args.enrollmentId,
          sessionDate,
        },
      },
    });

    const row = await tx.attendance.upsert({
      where: {
        enrollmentId_sessionDate: {
          enrollmentId: args.enrollmentId,
          sessionDate,
        },
      },
      create: {
        enrollmentId: args.enrollmentId,
        sessionDate,
        status,
        source: "AUTO_JOIN",
        joinedAt,
      },
      update: {
        joinedAt,
        status:
          status === "PRESENT"
            ? { set: "PRESENT" }
            : undefined,
        source: { set: "AUTO_JOIN" },
      },
    });

    if (!existing) {
      await appendChangeLog(tx, {
        attendanceId: row.id,
        previousStatus: null,
        newStatus: status,
        source: "AUTO_JOIN",
        comment: ATTENDANCE_SYSTEM_COMMENT.STUDENT_JOINED,
      });
    } else if (existing.status !== row.status && row.status === "PRESENT") {
      await appendChangeLog(tx, {
        attendanceId: row.id,
        previousStatus: existing.status,
        newStatus: row.status,
        source: "AUTO_JOIN",
        comment: ATTENDANCE_SYSTEM_COMMENT.STUDENT_JOINED,
      });
    }

    return row;
  });
}

export const markAttendanceSchema = z.object({
  enrollmentId: z.string().cuid(),
  sessionDate: z.string().datetime(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  comment: z.string().trim().min(1, "Comment is required").max(2000),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;

/**
 * Teacher override. Verifies the teacher owns the offering attached to the
 * enrollment before writing the record and appending an audit log entry.
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

  const sessionDate = parseAttendanceSessionDateKey(input.sessionDate);
  if (!canTakeSessionAttendanceForOccurrence(sessionDate)) {
    throw new Error(ATTENDANCE_NOT_YET_AVAILABLE_MESSAGE);
  }
  const comment = input.comment.trim();
  const teacherNoteUpdatedAt = comment ? new Date() : null;

  return db.$transaction(async (tx) => {
    const existing = await tx.attendance.findUnique({
      where: {
        enrollmentId_sessionDate: {
          enrollmentId: input.enrollmentId,
          sessionDate,
        },
      },
    });

    const row = await tx.attendance.upsert({
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
        teacherNote: comment,
        teacherNoteUpdatedAt,
      },
      update: {
        status: input.status,
        source: "TEACHER",
        markedByUserId: teacherUserId,
        teacherNote: comment,
        teacherNoteUpdatedAt,
      },
    });

    await appendChangeLog(tx, {
      attendanceId: row.id,
      previousStatus: existing?.status ?? null,
      newStatus: input.status,
      source: "TEACHER",
      changedByUserId: teacherUserId,
      comment,
    });

    await tx.sessionOccurrence.upsert({
      where: {
        offeringId_sessionDate: {
          offeringId: enrollment.offeringId,
          sessionDate,
        },
      },
      create: {
        offeringId: enrollment.offeringId,
        sessionDate,
        outcome: "HELD",
        markedByUserId: teacherUserId,
      },
      update: {
        outcome: "HELD",
        markedByUserId: teacherUserId,
      },
    });

    return row;
  });
}

async function mapChangeLogs(
  logs: Array<{
    id: string;
    previousStatus: AttendanceStatus | null;
    newStatus: AttendanceStatus;
    source: AttendanceSource;
    comment: string;
    createdAt: Date;
    changedBy: { name: string } | null;
  }>,
): Promise<AttendanceChangeLogEntry[]> {
  return logs.map((log) => ({
    id: log.id,
    previousStatus: log.previousStatus,
    newStatus: log.newStatus,
    source: log.source,
    changedByName: log.changedBy?.name ?? null,
    comment: log.comment,
    createdAt: log.createdAt,
  }));
}

export interface TeacherSessionAttendanceStudent {
  enrollmentId: string;
  studentName: string;
  attendanceId: string | null;
  status: AttendanceStatus | null;
  source: AttendanceSource | null;
  /** Set when the student joined the live class session. */
  joinedAt: Date | null;
  teacherNote: string | null;
  studentNote: string | null;
  changeLog: AttendanceChangeLogEntry[];
}

export interface TeacherSessionAttendance {
  offeringId: string;
  offeringTitle: string;
  subjectName: string;
  startMinutes: number;
  endMinutes: number;
  sessionDate: Date;
  sessionEnded: boolean;
  inJoinWindow: boolean;
  sessionOutcome: "HELD" | "NOT_HELD" | null;
  notHeldReason: import("@prisma/client").SessionNotHeldReason | null;
  teacherNote: string | null;
  studentNote: string | null;
  students: TeacherSessionAttendanceStudent[];
}

async function buildTeacherSessionAttendance(
  offering: {
    id: string;
    title: string;
    dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
    startMinutes: number;
    endMinutes: number;
    subject: { name: string };
    recurrenceKind: Parameters<typeof recurrenceFromDb>[0]["recurrenceKind"];
    recurrenceAnchorDate: Date | null;
    recurrenceOrdinal: number | null;
    enrollments: Array<{
      id: string;
      studentProfile: { user: { name: string } };
    }>;
  },
  sessionDate: Date,
  now: Date,
): Promise<TeacherSessionAttendance> {
  const normalizedDate = keyForOccurrence(sessionDate);

  if (sessionHasEnded(normalizedDate, offering.endMinutes, now)) {
    await finalizeSessionAttendance({
      offeringId: offering.id,
      sessionDate: normalizedDate,
      endMinutes: offering.endMinutes,
      now,
    });
  }

  const inJoinWindow = isSessionInScheduledWindow(
    normalizedDate,
    offering.startMinutes,
    offering.endMinutes,
    now,
  );

  const attendanceRows = await db.attendance.findMany({
    where: {
      sessionDate: normalizedDate,
      enrollmentId: { in: offering.enrollments.map((e) => e.id) },
    },
    include: {
      changeLogs: {
        orderBy: { createdAt: "desc" },
        include: {
          changedBy: { select: { name: true } },
        },
      },
    },
  });
  const byEnrollment = new Map(attendanceRows.map((r) => [r.enrollmentId, r]));

  const occurrence = await db.sessionOccurrence.findUnique({
    where: {
      offeringId_sessionDate: {
        offeringId: offering.id,
        sessionDate: normalizedDate,
      },
    },
  });

  return {
    offeringId: offering.id,
    offeringTitle: offering.title,
    subjectName: offering.subject.name,
    startMinutes: offering.startMinutes,
    endMinutes: offering.endMinutes,
    sessionDate: normalizedDate,
    sessionEnded: sessionHasEnded(normalizedDate, offering.endMinutes, now),
    inJoinWindow,
    sessionOutcome: occurrence?.outcome ?? null,
    notHeldReason: occurrence?.notHeldReason ?? null,
    teacherNote: occurrence?.teacherNote ?? null,
    studentNote: occurrence?.studentNote ?? null,
    students: await Promise.all(
      offering.enrollments.map(async (e) => {
        const row = byEnrollment.get(e.id);
        return {
          enrollmentId: e.id,
          studentName: e.studentProfile.user.name,
          attendanceId: row?.id ?? null,
          status: row?.status ?? null,
          source: row?.source ?? null,
          joinedAt: row?.joinedAt ?? null,
          teacherNote: row?.teacherNote ?? null,
          studentNote: row?.studentNote ?? null,
          changeLog: row ? await mapChangeLogs(row.changeLogs) : [],
        };
      }),
    ),
  };
}

/**
 * Returns attendance roster + audit log for a specific class session.
 */
export async function getTeacherSessionAttendance(
  teacherUserId: string,
  offeringId: string,
  sessionDateIso: string,
) {
  const offering = await db.classOffering.findUnique({
    where: { id: offeringId },
    include: {
      subject: true,
      teacherProfile: { select: { userId: true } },
      enrollments: {
        where: { status: "ACTIVE" },
        include: {
          studentProfile: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
  });
  if (!offering) throw new Error("Class not found");
  if (offering.teacherProfile.userId !== teacherUserId) {
    throw new Error("Forbidden: you do not teach this class");
  }

  const sessionDate = parseAttendanceSessionDateKey(sessionDateIso);
  if (!canTakeSessionAttendanceForOccurrence(sessionDate)) {
    throw new Error(ATTENDANCE_NOT_YET_AVAILABLE_MESSAGE);
  }

  return buildTeacherSessionAttendance(offering, sessionDate, new Date());
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

  const results = await Promise.all(
    offerings
      .filter((o) =>
        offeringOccursOnDate(
          recurrenceFromDb({
            recurrenceKind: o.recurrenceKind,
            recurrenceAnchorDate: o.recurrenceAnchorDate,
            recurrenceOrdinal: o.recurrenceOrdinal,
          }),
          o.dayOfWeek,
          now,
        ),
      )
      .map(async (o) => {
        const recurrence = recurrenceFromDb({
          recurrenceKind: o.recurrenceKind,
          recurrenceAnchorDate: o.recurrenceAnchorDate,
          recurrenceOrdinal: o.recurrenceOrdinal,
        });
        const sessionDate =
          resolveCurrentSessionDate({
            dayOfWeek: o.dayOfWeek,
            startMinutes: o.startMinutes,
            recurrence,
            now,
          }) ??
          keyForOccurrence(
            nextOccurrence(
              o.dayOfWeek,
              o.startMinutes,
              new Date(now.getTime() - 3 * 60 * 60 * 1000),
              recurrence,
            ),
          );

        const session = await buildTeacherSessionAttendance(o, sessionDate, now);
        if (!canTakeSessionAttendanceForOccurrence(session.sessionDate, now)) {
          return null;
        }
        return {
          offeringId: session.offeringId,
          offeringTitle: session.offeringTitle,
          subjectName: session.subjectName,
          startMinutes: session.startMinutes,
          endMinutes: session.endMinutes,
          sessionDate: session.sessionDate,
          inJoinWindow: session.inJoinWindow,
          sessionOutcome: session.sessionOutcome,
          notHeldReason: session.notHeldReason,
          teacherNote: session.teacherNote,
          studentNote: session.studentNote,
          students: session.students.map((stu) => ({
            enrollmentId: stu.enrollmentId,
            studentName: stu.studentName,
            status: stu.status,
            source: stu.source,
            joinedAt: stu.joinedAt,
            teacherNote: stu.teacherNote,
            studentNote: stu.studentNote,
            changeLog: stu.changeLog,
          })),
        };
      }),
  );

  return results.filter((row): row is NonNullable<typeof row> => row !== null);
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
