import "server-only";
import { z } from "zod";
import type { SessionNotHeldReason, SessionOutcome } from "@prisma/client";
import { db } from "@/lib/db";
import {
  ATTENDANCE_NOT_YET_AVAILABLE_MESSAGE,
  canTakeSessionAttendance,
} from "@/lib/sessionAttendance";
import {
  keyForOccurrence,
  occurrenceMapKey,
  resolveSessionMarker,
  sessionDateFromCalendarDate,
  type SessionOccurrenceSnapshot,
} from "@/lib/sessionOccurrenceKey";

export const markSessionNotHeldSchema = z.object({
  offeringId: z.string().cuid(),
  sessionDate: z.string().datetime(),
  notHeldReason: z.enum([
    "TEACHER_CANCELED",
    "TEACHER_UNAVAILABLE",
    "STUDENT_REQUEST",
    "TECHNICAL_ISSUE",
    "OTHER",
  ]),
  teacherNote: z.string().max(2000).optional(),
});

export type MarkSessionNotHeldInput = z.infer<typeof markSessionNotHeldSchema>;

export const sessionCommentSchema = z.object({
  enrollmentId: z.string().cuid(),
  sessionDate: z.string().datetime(),
  note: z.string().min(1).max(2000),
});

export type SessionCommentInput = z.infer<typeof sessionCommentSchema>;

async function assertTeacherOwnsOffering(teacherUserId: string, offeringId: string) {
  const offering = await db.classOffering.findUnique({
    where: { id: offeringId },
    select: {
      id: true,
      startMinutes: true,
      teacherProfile: { select: { userId: true } },
    },
  });
  if (!offering) throw new Error("Class not found");
  if (offering.teacherProfile.userId !== teacherUserId) {
    throw new Error("Forbidden: you do not teach this class");
  }
  return offering;
}

async function assertStudentEnrollment(studentUserId: string, enrollmentId: string) {
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      studentProfile: { select: { userId: true } },
      offering: true,
    },
  });
  if (!enrollment) throw new Error("Enrollment not found");
  if (enrollment.studentProfile.userId !== studentUserId) {
    throw new Error("Forbidden");
  }
  if (enrollment.status !== "ACTIVE") throw new Error("Enrollment is not active");
  return enrollment;
}

export async function markSessionNotHeld(teacherUserId: string, input: MarkSessionNotHeldInput) {
  const offering = await assertTeacherOwnsOffering(teacherUserId, input.offeringId);
  const sessionDate = keyForOccurrence(new Date(input.sessionDate));
  if (!canTakeSessionAttendance(sessionDate, offering.startMinutes)) {
    throw new Error(ATTENDANCE_NOT_YET_AVAILABLE_MESSAGE);
  }

  const teacherNote = input.teacherNote?.trim() || null;
  const teacherNoteUpdatedAt = teacherNote ? new Date() : null;

  return db.sessionOccurrence.upsert({
    where: {
      offeringId_sessionDate: {
        offeringId: input.offeringId,
        sessionDate,
      },
    },
    create: {
      offeringId: input.offeringId,
      sessionDate,
      outcome: "NOT_HELD",
      notHeldReason: input.notHeldReason,
      teacherNote,
      teacherNoteUpdatedAt,
      markedByUserId: teacherUserId,
    },
    update: {
      outcome: "NOT_HELD",
      notHeldReason: input.notHeldReason,
      teacherNote,
      teacherNoteUpdatedAt,
      markedByUserId: teacherUserId,
    },
  });
}

export async function markSessionHeld(teacherUserId: string, offeringId: string, sessionDateIso: string) {
  const offering = await assertTeacherOwnsOffering(teacherUserId, offeringId);
  const sessionDate = keyForOccurrence(new Date(sessionDateIso));
  if (!canTakeSessionAttendance(sessionDate, offering.startMinutes)) {
    throw new Error(ATTENDANCE_NOT_YET_AVAILABLE_MESSAGE);
  }

  return db.sessionOccurrence.upsert({
    where: {
      offeringId_sessionDate: { offeringId, sessionDate },
    },
    create: {
      offeringId,
      sessionDate,
      outcome: "HELD",
      markedByUserId: teacherUserId,
    },
    update: {
      outcome: "HELD",
      notHeldReason: null,
      markedByUserId: teacherUserId,
    },
  });
}

export async function addStudentSessionComment(studentUserId: string, input: SessionCommentInput) {
  await assertStudentEnrollment(studentUserId, input.enrollmentId);
  const sessionDate = keyForOccurrence(new Date(input.sessionDate));
  const note = input.note.trim();
  const studentNoteUpdatedAt = new Date();

  return db.attendance.upsert({
    where: {
      enrollmentId_sessionDate: { enrollmentId: input.enrollmentId, sessionDate },
    },
    create: {
      enrollmentId: input.enrollmentId,
      sessionDate,
      status: "ABSENT",
      source: "STUDENT",
      studentNote: note,
      studentNoteUpdatedAt,
    },
    update: {
      studentNote: note,
      studentNoteUpdatedAt,
    },
  });
}

export async function addTeacherSessionComment(
  teacherUserId: string,
  enrollmentId: string,
  sessionDateIso: string,
  note: string,
) {
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      offering: { include: { teacherProfile: { select: { userId: true } } } },
    },
  });
  if (!enrollment) throw new Error("Enrollment not found");
  if (enrollment.offering.teacherProfile.userId !== teacherUserId) {
    throw new Error("Forbidden: you do not teach this class");
  }

  const sessionDate = keyForOccurrence(new Date(sessionDateIso));
  const trimmed = note.trim();
  const teacherNoteUpdatedAt = trimmed ? new Date() : null;

  return db.attendance.upsert({
    where: {
      enrollmentId_sessionDate: { enrollmentId, sessionDate },
    },
    create: {
      enrollmentId,
      sessionDate,
      status: "ABSENT",
      source: "TEACHER",
      teacherNote: trimmed,
      teacherNoteUpdatedAt,
      markedByUserId: teacherUserId,
    },
    update: {
      teacherNote: trimmed,
      teacherNoteUpdatedAt,
      markedByUserId: teacherUserId,
    },
  });
}

function noteUpdatedAtIso(
  note: string | null | undefined,
  updatedAt: Date | null | undefined,
): string | null {
  return note?.trim() && updatedAt ? updatedAt.toISOString() : null;
}

function resolveNoteUpdatedAtIso(args: {
  note: string | null;
  attendanceNote: string | null;
  attendanceUpdatedAt: Date | null | undefined;
  attendanceFallbackUpdatedAt?: Date | null | undefined;
  occurrenceNote: string | null | undefined;
  occurrenceUpdatedAt: Date | null | undefined;
  occurrenceFallbackUpdatedAt?: Date | null | undefined;
}): string | null {
  if (!args.note?.trim()) return null;
  if (args.attendanceNote?.trim()) {
    return noteUpdatedAtIso(
      args.attendanceNote,
      args.attendanceUpdatedAt ?? args.attendanceFallbackUpdatedAt,
    );
  }
  if (args.occurrenceNote?.trim()) {
    return noteUpdatedAtIso(
      args.occurrenceNote,
      args.occurrenceUpdatedAt ?? args.occurrenceFallbackUpdatedAt,
    );
  }
  return null;
}

export async function listStudentOccurrenceMap(args: {
  enrollments: Array<{
    enrollmentId: string;
    offeringId: string;
    startMinutes: number;
    endMinutes: number;
  }>;
}) {
  if (args.enrollments.length === 0) {
    return {} as Record<string, SessionOccurrenceSnapshot>;
  }

  const offeringIds = [...new Set(args.enrollments.map((e) => e.offeringId))];
  const enrollmentIds = args.enrollments.map((e) => e.enrollmentId);
  const now = new Date();

  let occurrences: Awaited<ReturnType<typeof db.sessionOccurrence.findMany>> = [];
  let attendanceRows: Awaited<
    ReturnType<
      typeof db.attendance.findMany<{
        include: {
          changeLogs: {
            where: { source: "TEACHER" };
            orderBy: { createdAt: "desc" };
            take: 1;
            select: { createdAt: true };
          };
        };
      }>
    >
  > = [];

  try {
    [occurrences, attendanceRows] = await Promise.all([
      db.sessionOccurrence.findMany({
        where: { offeringId: { in: offeringIds } },
      }),
      db.attendance.findMany({
        where: { enrollmentId: { in: enrollmentIds } },
        include: {
          changeLogs: {
            where: { source: "TEACHER" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
          },
        },
      }),
    ]);
  } catch (err) {
    // When migrations lag behind the schema (missing SessionOccurrence table/columns),
    // fall back to attendance-only data so /classes never stalls on the loading shell.
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: unknown }).code)
        : "";
    if (code !== "P2021" && code !== "P2022") throw err;

    try {
      attendanceRows = await db.attendance.findMany({
        where: { enrollmentId: { in: enrollmentIds } },
        include: {
          changeLogs: {
            where: { source: "TEACHER" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
          },
        },
      });
    } catch {
      return {} as Record<string, SessionOccurrenceSnapshot>;
    }
  }

  const occurrenceByKey = new Map(
    occurrences.map((o) => [occurrenceMapKey(o.offeringId, o.sessionDate), o]),
  );

  const enrollmentById = new Map(args.enrollments.map((e) => [e.enrollmentId, e]));

  const map: Record<string, SessionOccurrenceSnapshot> = {};

  for (const row of attendanceRows) {
    const enrollment = enrollmentById.get(row.enrollmentId);
    if (!enrollment) continue;

    const sessionDate = keyForOccurrence(row.sessionDate);
    const key = occurrenceMapKey(enrollment.offeringId, sessionDate);
    const occurrence = occurrenceByKey.get(key);

    const calendarDate = new Date(sessionDate);
    const isPast =
      now.getTime() >
      sessionDateFromCalendarDate(calendarDate, enrollment.endMinutes).getTime();

    const teacherNote = row.teacherNote ?? occurrence?.teacherNote ?? null;
    const studentNote = row.studentNote ?? occurrence?.studentNote ?? null;

    map[key] = {
      marker: resolveSessionMarker({
        outcome: occurrence?.outcome ?? null,
        attendanceStatus: row.status,
        isPast,
      }),
      outcome: occurrence?.outcome ?? null,
      notHeldReason: occurrence?.notHeldReason ?? null,
      attendanceStatus: row.status,
      teacherNote,
      studentNote,
      teacherNoteUpdatedAtIso:
        resolveNoteUpdatedAtIso({
          note: teacherNote,
          attendanceNote: row.teacherNote,
          attendanceUpdatedAt:
            row.teacherNoteUpdatedAt ?? row.changeLogs[0]?.createdAt ?? null,
          occurrenceNote: occurrence?.teacherNote,
          occurrenceUpdatedAt: occurrence?.teacherNoteUpdatedAt,
        }),
      studentNoteUpdatedAtIso: resolveNoteUpdatedAtIso({
        note: studentNote,
        attendanceNote: row.studentNote,
        attendanceUpdatedAt: row.studentNoteUpdatedAt,
        attendanceFallbackUpdatedAt: row.updatedAt,
        occurrenceNote: occurrence?.studentNote,
        occurrenceUpdatedAt: occurrence?.studentNoteUpdatedAt,
        occurrenceFallbackUpdatedAt: occurrence?.updatedAt,
      }),
      sessionDateIso: sessionDate.toISOString(),
    };
  }

  for (const occurrence of occurrences) {
    const key = occurrenceMapKey(occurrence.offeringId, occurrence.sessionDate);
    if (map[key]) continue;

    const enrollment = args.enrollments.find((e) => e.offeringId === occurrence.offeringId);
    if (!enrollment) continue;

    const calendarDate = new Date(occurrence.sessionDate);
    const isPast =
      now.getTime() >
      sessionDateFromCalendarDate(calendarDate, enrollment.endMinutes).getTime();

    map[key] = {
      marker: resolveSessionMarker({
        outcome: occurrence.outcome,
        attendanceStatus: null,
        isPast,
      }),
      outcome: occurrence.outcome,
      notHeldReason: occurrence.notHeldReason,
      attendanceStatus: null,
      teacherNote: occurrence.teacherNote,
      studentNote: occurrence.studentNote,
      teacherNoteUpdatedAtIso: noteUpdatedAtIso(
        occurrence.teacherNote,
        occurrence.teacherNoteUpdatedAt,
      ),
      studentNoteUpdatedAtIso: noteUpdatedAtIso(
        occurrence.studentNote,
        occurrence.studentNoteUpdatedAt ?? occurrence.updatedAt,
      ),
      sessionDateIso: keyForOccurrence(occurrence.sessionDate).toISOString(),
    };
  }

  return map;
}

export function buildOccurrenceSnapshot(args: {
  offeringId: string;
  enrollmentId: string;
  startMinutes: number;
  endMinutes: number;
  calendarDate: Date;
  map: Record<string, SessionOccurrenceSnapshot>;
  now?: Date;
}): SessionOccurrenceSnapshot | null {
  const now = args.now ?? new Date();
  const isPast = isPastSessionEnd(args.calendarDate, args.endMinutes, now);
  if (!isPast) return null;

  const sessionDate = sessionDateFromCalendarDate(args.calendarDate, args.startMinutes);
  const key = occurrenceMapKey(args.offeringId, sessionDate);
  const existing = args.map[key];

  if (existing) return existing;

  return {
    marker: null,
    outcome: null,
    notHeldReason: null,
    attendanceStatus: null,
    teacherNote: null,
    studentNote: null,
    teacherNoteUpdatedAtIso: null,
    studentNoteUpdatedAtIso: null,
    sessionDateIso: sessionDate.toISOString(),
  };
}

function isPastSessionEnd(calendarDate: Date, endMinutes: number, now: Date): boolean {
  const end = sessionDateFromCalendarDate(calendarDate, endMinutes);
  return now.getTime() > end.getTime();
}

export type { SessionOccurrenceSnapshot, SessionOutcome, SessionNotHeldReason };
