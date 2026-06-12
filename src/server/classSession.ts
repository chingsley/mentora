import "server-only";
import { db } from "@/lib/db";
import { isClassLive } from "@/lib/classSession";
import { recurrenceFromDb } from "@/lib/offeringRecurrence";
import { buildVideoCallCredentials, isJaasConfigured, mintJaasJwt } from "@/lib/jitsiJaas";
import { generateRoomName } from "@/lib/videoRoom";
import { recordAutoJoin, resolveCurrentSessionDate, finalizeSessionAttendance } from "./attendance";
import { keyForOccurrence } from "@/lib/sessionOccurrenceKey";

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

// ---------- Live video sessions (Jitsi rooms) ----------

export class ClassSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClassSessionError";
  }
}

/** Everything the classroom view needs to render the video call. */
export interface ClassroomAccess {
  offeringId: string;
  offeringTitle: string;
  subjectName: string;
  teacherName: string;
  /** Provider-ready room identifier (may include a JaaS tenant prefix). */
  roomName: string;
  /** Jitsi deployment domain (no protocol). */
  videoDomain: string;
  /** Tenant-scoped or domain-scoped external_api.js URL. */
  externalApiSrc: string;
  /** True when the server must mint a JaaS JWT before joining. */
  requiresJaasJwt: boolean;
  /** True when using the public meet.jit.si embed (5-minute demo cap). */
  isDemoEmbed: boolean;
  /** Name shown to other participants in the call. */
  displayName: string;
  /** Teachers join as moderators; students as regular participants. */
  isModerator: boolean;
  startedAt: Date;
}

function classroomAccessForUser(args: {
  offeringId: string;
  offeringTitle: string;
  subjectName: string;
  teacherName: string;
  roomSlug: string;
  userId: string;
  displayName: string;
  isModerator: boolean;
  startedAt: Date;
}): ClassroomAccess {
  const video = buildVideoCallCredentials({
    roomSlug: args.roomSlug,
    userId: args.userId,
    displayName: args.displayName,
    isModerator: args.isModerator,
  });
  return {
    offeringId: args.offeringId,
    offeringTitle: args.offeringTitle,
    subjectName: args.subjectName,
    teacherName: args.teacherName,
    roomName: video.roomName,
    videoDomain: video.domain,
    externalApiSrc: video.externalApiSrc,
    requiresJaasJwt: isJaasConfigured(),
    isDemoEmbed: video.isDemoEmbed,
    displayName: args.displayName,
    isModerator: args.isModerator,
    startedAt: args.startedAt,
  };
}

const OFFERING_SESSION_INCLUDE = {
  subject: { select: { name: true } },
  teacherProfile: { select: { userId: true, user: { select: { name: true } } } },
} as const;

function offeringLiveWindow(offering: {
  dayOfWeek: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  startMinutes: number;
  endMinutes: number;
  recurrenceKind: Parameters<typeof recurrenceFromDb>[0]["recurrenceKind"];
  recurrenceAnchorDate: Date | null;
  recurrenceOrdinal: number | null;
  recurrenceInterval: number | null;
}) {
  return {
    dayOfWeek: offering.dayOfWeek,
    startMinutes: offering.startMinutes,
    endMinutes: offering.endMinutes,
    recurrence: recurrenceFromDb({
      recurrenceKind: offering.recurrenceKind,
      recurrenceAnchorDate: offering.recurrenceAnchorDate,
      recurrenceOrdinal: offering.recurrenceOrdinal,
      recurrenceInterval: offering.recurrenceInterval,
    }),
  };
}

/** Resolve the currently LIVE session for an offering, if any. */
export async function getActiveClassSession(offeringId: string) {
  return db.classSession.findFirst({
    where: { offeringId, status: "LIVE" },
    orderBy: { startedAt: "desc" },
  });
}

/** Read-only state used to render the classroom page (no mutations). */
export type ClassroomView =
  | { kind: "live"; access: ClassroomAccess }
  | { kind: "teacher-idle"; offeringId: string; offeringTitle: string; canStart: boolean }
  | {
      kind: "student-waiting";
      offeringId: string;
      offeringTitle: string;
      teacherName: string;
    }
  | { kind: "forbidden"; reason: string };

/**
 * Resolve what a viewer should see at `/classroom/[offeringId]` without writing
 * anything. Attendance + session creation happen via explicit actions.
 */
export async function getClassroomView(
  userId: string,
  role: "TEACHER" | "STUDENT" | "ADMIN" | "GUARDIAN",
  offeringId: string,
): Promise<ClassroomView> {
  const offering = await db.classOffering.findUnique({
    where: { id: offeringId },
    include: OFFERING_SESSION_INCLUDE,
  });
  if (!offering) return { kind: "forbidden", reason: "Class not found" };

  const active = await getActiveClassSession(offeringId);
  const isOwner =
    role === "TEACHER" && offering.teacherProfile.userId === userId;

  if (isOwner) {
    if (active) {
      return {
        kind: "live",
        access: classroomAccessForUser({
          offeringId,
          offeringTitle: offering.title,
          subjectName: offering.subject.name,
          teacherName: offering.teacherProfile.user.name,
          roomSlug: active.roomName,
          userId,
          displayName: offering.teacherProfile.user.name,
          isModerator: true,
          startedAt: active.startedAt,
        }),
      };
    }
    return {
      kind: "teacher-idle",
      offeringId,
      offeringTitle: offering.title,
      canStart: isClassLive(offeringLiveWindow(offering)),
    };
  }

  if (role === "STUDENT") {
    const student = await db.studentProfile.findUnique({
      where: { userId },
      select: { id: true, user: { select: { name: true } } },
    });
    if (!student) return { kind: "forbidden", reason: "Student profile not found" };

    const enrollment = await db.enrollment.findFirst({
      where: { offeringId, studentProfileId: student.id, status: "ACTIVE" },
      select: { id: true },
    });
    if (!enrollment) {
      return { kind: "forbidden", reason: "You are not enrolled in this class" };
    }

    if (active) {
      return {
        kind: "live",
        access: classroomAccessForUser({
          offeringId,
          offeringTitle: offering.title,
          subjectName: offering.subject.name,
          teacherName: offering.teacherProfile.user.name,
          roomSlug: active.roomName,
          userId,
          displayName: student.user.name,
          isModerator: false,
          startedAt: active.startedAt,
        }),
      };
    }
    return {
      kind: "student-waiting",
      offeringId,
      offeringTitle: offering.title,
      teacherName: offering.teacherProfile.user.name,
    };
  }

  return { kind: "forbidden", reason: "You don't have access to this class" };
}

/**
 * Teacher starts (or rejoins) a live class. Verifies ownership and that the
 * class is within its scheduled window, then creates or reuses a LIVE session.
 */
export async function startClassSession(
  teacherUserId: string,
  offeringId: string,
): Promise<ClassroomAccess> {
  const offering = await db.classOffering.findUnique({
    where: { id: offeringId },
    include: OFFERING_SESSION_INCLUDE,
  });
  if (!offering) throw new ClassSessionError("Class not found");
  if (offering.teacherProfile.userId !== teacherUserId) {
    throw new ClassSessionError("You can only start your own classes");
  }
  if (!isClassLive(offeringLiveWindow(offering))) {
    throw new ClassSessionError(
      "This class isn't in its scheduled time window yet.",
    );
  }

  const existing = await getActiveClassSession(offeringId);
  const session =
    existing ??
    (await db.classSession.create({
      data: {
        offeringId,
        roomName: generateRoomName(),
        startedByUserId: teacherUserId,
        status: "LIVE",
      },
    }));

  return classroomAccessForUser({
    offeringId,
    offeringTitle: offering.title,
    subjectName: offering.subject.name,
    teacherName: offering.teacherProfile.user.name,
    roomSlug: session.roomName,
    userId: teacherUserId,
    displayName: offering.teacherProfile.user.name,
    isModerator: true,
    startedAt: session.startedAt,
  });
}

/** Teacher ends the live session (best-effort; safe to call when none is live). */
export async function endClassSession(teacherUserId: string, offeringId: string) {
  const offering = await db.classOffering.findUnique({
    where: { id: offeringId },
    select: {
      dayOfWeek: true,
      startMinutes: true,
      endMinutes: true,
      recurrenceKind: true,
      recurrenceAnchorDate: true,
      recurrenceOrdinal: true,
      recurrenceInterval: true,
      teacherProfile: { select: { userId: true } },
    },
  });
  if (!offering) throw new ClassSessionError("Class not found");
  if (offering.teacherProfile.userId !== teacherUserId) {
    throw new ClassSessionError("You can only end your own classes");
  }
  await db.classSession.updateMany({
    where: { offeringId, status: "LIVE" },
    data: { status: "ENDED", endedAt: new Date() },
  });

  const window = offeringLiveWindow(offering);
  const sessionDate = resolveCurrentSessionDate({
    dayOfWeek: window.dayOfWeek,
    startMinutes: window.startMinutes,
    recurrence: window.recurrence,
  });
  if (sessionDate) {
    await finalizeSessionAttendance({
      offeringId,
      sessionDate: keyForOccurrence(sessionDate),
      endMinutes: offering.endMinutes,
    });
  }
}

/**
 * Student joins the teacher's live session. Verifies an ACTIVE enrollment,
 * requires a LIVE session to exist, and records attendance on the way in.
 */
export async function joinClassSessionAsStudent(
  studentUserId: string,
  offeringId: string,
): Promise<ClassroomAccess> {
  const student = await db.studentProfile.findUnique({
    where: { userId: studentUserId },
    select: { id: true, user: { select: { name: true } } },
  });
  if (!student) throw new ClassSessionError("Student profile not found");

  const offering = await db.classOffering.findUnique({
    where: { id: offeringId },
    include: {
      ...OFFERING_SESSION_INCLUDE,
      enrollments: {
        where: { studentProfileId: student.id, status: "ACTIVE" },
        select: { id: true },
      },
    },
  });
  if (!offering) throw new ClassSessionError("Class not found");

  const enrollment = offering.enrollments[0];
  if (!enrollment) {
    throw new ClassSessionError("You are not enrolled in this class");
  }

  const session = await getActiveClassSession(offeringId);
  if (!session) {
    throw new ClassSessionError(
      "The teacher hasn't started this class yet. Try again once it's live.",
    );
  }

  const window = offeringLiveWindow(offering);
  const sessionDate = resolveCurrentSessionDate({
    dayOfWeek: window.dayOfWeek,
    startMinutes: window.startMinutes,
    recurrence: window.recurrence,
  });
  if (sessionDate) {
    await recordAutoJoin({ enrollmentId: enrollment.id, sessionDate });
  }

  return classroomAccessForUser({
    offeringId,
    offeringTitle: offering.title,
    subjectName: offering.subject.name,
    teacherName: offering.teacherProfile.user.name,
    roomSlug: session.roomName,
    userId: studentUserId,
    displayName: student.user.name,
    isModerator: false,
    startedAt: session.startedAt,
  });
}

/**
 * Mint a JaaS JWT for the current viewer. Re-checks classroom access so tokens
 * are never issued to unauthorized users.
 */
export async function mintClassroomJitsiJwt(
  userId: string,
  role: "TEACHER" | "STUDENT" | "ADMIN" | "GUARDIAN",
  offeringId: string,
): Promise<string> {
  const view = await getClassroomView(userId, role, offeringId);
  if (view.kind !== "live") {
    throw new ClassSessionError("This class is not live.");
  }
  if (!view.access.requiresJaasJwt) {
    throw new ClassSessionError("JaaS is not configured for this deployment.");
  }
  return mintJaasJwt({
    roomName: view.access.roomName,
    userId,
    displayName: view.access.displayName,
    isModerator: view.access.isModerator,
  });
}
