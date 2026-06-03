import "server-only";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { DayOfWeek } from "@prisma/client";
import { db } from "@/lib/db";
import { clampTeacherCap } from "@/lib/capacity";
import { majorToSmallest } from "@/lib/money";
import { isTeacherCoursesPhaseComplete } from "@/lib/teacherCoursesCompleteness";
import { assertAtLeastMinRate } from "@/lib/pricing";
import { intervalsOverlapHalfOpen } from "@/lib/scheduleOverlap";
import { minutesToTime } from "@/lib/time";
import {
  scheduleGroupIdForSlotCount,
  sortOfferingDaySlots,
} from "@/lib/offeringSchedule";
import {
  offeringRecurrenceSchema,
  recurrenceFromInput,
  recurrenceToDb,
} from "@/lib/offeringRecurrence";
import { TEACHER_PROFILE_ADD_COURSE } from "@/constants/teacherProfileCourse.constants";
import { getPolicy } from "./policies";

export interface TeacherSearchFilters {
  subjectSlug?: string;
  regionCode?: string;
  query?: string;
  maxHourlyRate?: number;
  dayOfWeek?: DayOfWeek;
  minRating?: number;
}

export async function searchTeachers(filters: TeacherSearchFilters) {
  const { subjectSlug, regionCode, query, maxHourlyRate, dayOfWeek, minRating } = filters;

  const queryClauses: Prisma.TeacherProfileWhereInput[] = [];
  if (query) {
    const q = query.trim();
    if (q.length > 0) {
      queryClauses.push({
        OR: [
          { user: { name: { contains: q, mode: "insensitive" } } },
          { displayId: { contains: q, mode: "insensitive" } },
          { headline: { contains: q, mode: "insensitive" } },
          { subjects: { some: { subject: { name: { contains: q, mode: "insensitive" } } } } },
        ],
      });
    }
  }

  return db.teacherProfile.findMany({
    where: {
      AND: queryClauses,
      user: regionCode ? { region: { code: regionCode } } : undefined,
      subjects: subjectSlug ? { some: { subject: { slug: subjectSlug } } } : undefined,
      rates:
        maxHourlyRate !== undefined
          ? { some: { hourlyRate: { lte: maxHourlyRate } } }
          : undefined,
      offerings: dayOfWeek ? { some: { dayOfWeek, active: true } } : undefined,
      avgRating: minRating !== undefined ? { gte: minRating } : undefined,
    },
    include: {
      user: { select: { id: true, name: true, image: true, region: true } },
      subjects: { include: { subject: true } },
      rates: { include: { region: true, subject: true } },
      offerings: {
        where: { active: true },
        select: { dayOfWeek: true },
      },
    },
    orderBy: [{ avgRating: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function recommendTeachers(studentUserId: string, limit = 6) {
  const student = await db.studentProfile.findUnique({
    where: { userId: studentUserId },
    select: { interests: { select: { subjectId: true } } },
  });
  const subjectIds = student?.interests.map((i) => i.subjectId) ?? [];
  if (subjectIds.length === 0) return [];

  return db.teacherProfile.findMany({
    where: {
      subjects: { some: { subjectId: { in: subjectIds } } },
    },
    include: {
      user: { select: { id: true, name: true, image: true, region: true } },
      subjects: { include: { subject: true } },
      rates: { include: { region: true, subject: true } },
      offerings: {
        where: { active: true },
        select: { dayOfWeek: true },
      },
    },
    orderBy: [{ avgRating: "desc" }, { ratingsCount: "desc" }],
    take: limit,
  });
}

export async function getTeacherById(teacherProfileId: string) {
  return db.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    include: {
      user: { select: { id: true, name: true, image: true, region: true } },
      subjects: { include: { subject: true } },
      rates: { include: { region: true, subject: true } },
      offerings: {
        where: { active: true },
        include: {
          subject: true,
          enrollments: { where: { status: "ACTIVE" }, select: { id: true } },
          invites: { select: { studentProfileId: true } },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startMinutes: "asc" }],
      },
    },
  });
}

export async function getStudentProfileIdForUser(
  userId: string | undefined,
): Promise<string | null> {
  if (!userId) return null;
  const row = await db.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return row?.id ?? null;
}

export async function getMyStudentEnrollmentsByOffering(
  studentUserId: string | undefined,
  offeringIds: string[],
): Promise<Record<string, string>> {
  if (!studentUserId || offeringIds.length === 0) return {};
  const student = await db.studentProfile.findUnique({
    where: { userId: studentUserId },
    select: { id: true },
  });
  if (!student) return {};
  const rows = await db.enrollment.findMany({
    where: {
      studentProfileId: student.id,
      offeringId: { in: offeringIds },
      status: "ACTIVE",
    },
    select: { id: true, offeringId: true },
  });
  const map: Record<string, string> = {};
  for (const row of rows) map[row.offeringId] = row.id;
  return map;
}

// ---------- My teacher profile (self view) ----------

/** Include clause shared with `MyTeacherProfile` so consumers get full scalars on profile + subjects. */
export const MY_TEACHER_PROFILE_INCLUDE = {
  user: {
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      region: true,
    },
  },
  subjects: {
    include: { subject: true },
    orderBy: [
      { sortOrder: "desc" as const },
      { createdAt: "desc" as const },
      { subjectId: "desc" as const },
    ],
  },
  rates: { include: { subject: true, region: true } },
  offerings: {
    include: {
      subject: true,
      enrollments: { where: { status: "ACTIVE" as const }, select: { id: true } },
      invites: { select: { studentProfileId: true } },
    },
    orderBy: [{ dayOfWeek: "asc" as const }, { startMinutes: "asc" as const }],
  },
} satisfies Prisma.TeacherProfileInclude;

export type MyTeacherProfile = Prisma.TeacherProfileGetPayload<{
  include: typeof MY_TEACHER_PROFILE_INCLUDE;
}>;

export async function getMyTeacherProfile(teacherUserId: string): Promise<{
  profile: MyTeacherProfile;
  studentsPerSubject: Record<string, number>;
  activeStudentCount: number;
} | null> {
  const profile = await db.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    include: MY_TEACHER_PROFILE_INCLUDE,
  });
  if (!profile) return null;

  const studentsBySubject = new Map<string, Set<string>>();
  for (const o of profile.offerings) {
    const enrolls = await db.enrollment.findMany({
      where: { offeringId: o.id, status: "ACTIVE" },
      select: { studentProfileId: true },
    });
    const bucket = studentsBySubject.get(o.subjectId) ?? new Set<string>();
    for (const e of enrolls) bucket.add(e.studentProfileId);
    studentsBySubject.set(o.subjectId, bucket);
  }

  const studentsPerSubject: Record<string, number> = {};
  for (const [subjectId, set] of studentsBySubject) {
    studentsPerSubject[subjectId] = set.size;
  }
  const activeStudents = new Set<string>();
  for (const set of studentsBySubject.values()) {
    for (const s of set) activeStudents.add(s);
  }

  return { profile, studentsPerSubject, activeStudentCount: activeStudents.size };
}

// ---------- Bio ----------

export const updateBioSchema = z.object({
  headline: z.string().trim().min(3).max(120),
  bio: z.string().trim().max(2000).optional().default(""),
});

export const setTeacherRegionSchema = z.object({
  regionCode: z.string().trim().min(1, "Select your teaching region").max(8),
});

export function normalizeSpokenLanguages(raw: string): string {
  const parts = raw
    .split(/[,;]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.join(", ");
}

export const saveTeacherBioTabSchema = z.object({
  bio: z.string().trim().max(2000).optional().default(""),
  spokenLanguages: z.string().trim().min(2, "Add languages you speak (e.g. English, Portuguese)").max(500),
  locationLabel: z.string().trim().max(120).optional().default(""),
});

export type SaveTeacherBioTabInput = z.infer<typeof saveTeacherBioTabSchema>;

export async function saveTeacherBioTab(teacherUserId: string, input: SaveTeacherBioTabInput) {
  const teacher = await requireTeacher(teacherUserId);
  const languages = normalizeSpokenLanguages(input.spokenLanguages);

  const teacherProfileBioData = {
    bio: input.bio ?? "",
    spokenLanguages: languages,
    locationLabel: input.locationLabel ?? "",
  } as Prisma.TeacherProfileUncheckedUpdateInput;

  await db.teacherProfile.update({
    where: { id: teacher.id },
    data: teacherProfileBioData,
  });

  await recomputeProfileCompleted(teacher.id);
}

export const saveTeacherPayoutTabSchema = z.object({
  payoutLegalName: z.string().trim().max(200).optional().default(""),
  payoutCountryCode: z
    .string()
    .trim()
    .max(2)
    .optional()
    .default("")
    .transform((s) => (s.length === 2 ? s.toUpperCase() : "")),
  payoutPreferredMethod: z.string().trim().max(64).optional().default(""),
  payoutNotes: z.string().trim().max(5000).optional().default(""),
});

export type SaveTeacherPayoutTabInput = z.infer<typeof saveTeacherPayoutTabSchema>;

export async function saveTeacherPayoutTab(teacherUserId: string, input: SaveTeacherPayoutTabInput) {
  const teacher = await requireTeacher(teacherUserId);
  const payoutData = {
    payoutLegalName: input.payoutLegalName || null,
    payoutCountryCode: input.payoutCountryCode || null,
    payoutPreferredMethod: input.payoutPreferredMethod?.trim() || null,
    payoutNotes: input.payoutNotes || null,
  } as Prisma.TeacherProfileUncheckedUpdateInput;

  await db.teacherProfile.update({
    where: { id: teacher.id },
    data: payoutData,
  });
}

export async function updateTeacherBio(
  teacherUserId: string,
  input: z.infer<typeof updateBioSchema>,
) {
  const teacher = await requireTeacher(teacherUserId);
  await db.teacherProfile.update({
    where: { id: teacher.id },
    data: { headline: input.headline, bio: input.bio ?? "" },
  });
  await recomputeProfileCompleted(teacher.id);
}

export async function setTeacherRegion(
  teacherUserId: string,
  input: z.infer<typeof setTeacherRegionSchema>,
) {
  const teacher = await requireTeacher(teacherUserId);
  const region = await db.region.findUnique({
    where: { code: input.regionCode },
    select: { id: true },
  });
  if (!region) throw new Error("Unknown region");
  await db.user.update({
    where: { id: teacherUserId },
    data: { regionId: region.id },
  });
  await recomputeProfileCompleted(teacher.id);
}

// ---------- Subjects ----------

export const setSubjectsSchema = z.object({
  subjects: z
    .array(
      z.object({
        subjectId: z.string().min(1),
        defaultCap: z.coerce.number().int().min(1).max(1000),
        courseDescription: z
          .string()
          .trim()
          .min(10, "Add a short course description (10+ characters)")
          .max(2000),
        gradeLevel: z
          .string()
          .trim()
          .min(1, "Add a grade level or level label (e.g. Grade 6, University)")
          .max(120),
        syllabus: z.string().trim().max(10000).optional().default(""),
      }),
    )
    .min(1, "Pick at least one subject"),
});

export async function setTeacherSubjects(
  teacherUserId: string,
  input: z.infer<typeof setSubjectsSchema>,
) {
  const teacher = await requireTeacher(teacherUserId);
  const policy = await getPolicy();

  const rows = new Map<
    string,
    {
      defaultCap: number;
      courseDescription: string;
      gradeLevel: string;
      syllabus: string;
    }
  >();
  for (const s of input.subjects) {
    rows.set(s.subjectId, {
      defaultCap: clampTeacherCap(s.defaultCap, policy.globalClassCap),
      courseDescription: s.courseDescription,
      gradeLevel: s.gradeLevel,
      syllabus: s.syllabus ?? "",
    });
  }

  await db.$transaction(async (tx) => {
    const existing = await tx.teacherSubject.findMany({
      where: { teacherProfileId: teacher.id },
      select: { subjectId: true },
    });
    const existingIds = new Set(existing.map((e) => e.subjectId));
    const newIds = new Set(rows.keys());

    const toDelete = [...existingIds].filter((id) => !newIds.has(id));
    if (toDelete.length > 0) {
      await tx.teacherSubject.deleteMany({
        where: { teacherProfileId: teacher.id, subjectId: { in: toDelete } },
      });
    }

    for (const [subjectId, meta] of rows) {
      const subjectRowCreate = {
        teacherProfileId: teacher.id,
        subjectId,
        defaultCap: meta.defaultCap,
        courseDescription: meta.courseDescription,
        gradeLevel: meta.gradeLevel,
        syllabus: meta.syllabus,
      } as Prisma.TeacherSubjectUncheckedCreateInput;

      const subjectRowUpdate = {
        defaultCap: meta.defaultCap,
        courseDescription: meta.courseDescription,
        gradeLevel: meta.gradeLevel,
        syllabus: meta.syllabus,
      } as Prisma.TeacherSubjectUncheckedUpdateInput;

      await tx.teacherSubject.upsert({
        where: { teacherProfileId_subjectId: { teacherProfileId: teacher.id, subjectId } },
        create: subjectRowCreate,
        update: subjectRowUpdate,
      });
    }
  });

  await recomputeProfileCompleted(teacher.id);
}

// ---------- Offerings (schedule) ----------

const offeringPayloadBaseSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  startMinutes: z.coerce.number().int().min(0).max(24 * 60 - 1),
  endMinutes: z.coerce.number().int().min(1).max(24 * 60),
  periodType: z.enum(["OPEN", "RESERVED"]).default("OPEN"),
  teacherCap: z.coerce.number().int().min(1).max(1000).optional(),
  invitedStudentProfileIds: z.array(z.string().min(1)).default([]),
});

type OfferingPeriodFields = {
  startMinutes: number;
  endMinutes: number;
  periodType: "OPEN" | "RESERVED";
  teacherCap?: number;
  invitedStudentProfileIds: string[];
};

function withOfferingPeriodValidation<T extends z.ZodType<OfferingPeriodFields>>(schema: T) {
  return schema
    .refine((v) => v.endMinutes > v.startMinutes, {
      message: "End time must be after start time",
      path: ["endMinutes"],
    })
    .superRefine((v, ctx) => {
      if (v.periodType === "OPEN") {
        if (v.teacherCap == null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Class cap is required for open periods",
            path: ["teacherCap"],
          });
        }
        return;
      }
      if (v.invitedStudentProfileIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select at least one invited student",
          path: ["invitedStudentProfileIds"],
        });
      }
    });
}

export const createOfferingSchema = withOfferingPeriodValidation(
  offeringPayloadBaseSchema.extend({
    dayOfWeek: z.nativeEnum(DayOfWeek),
    scheduleGroupId: z.string().min(1).nullable().optional(),
  }),
);

export type CreateOfferingInput = z.infer<typeof createOfferingSchema>;

const offeringDaySlotSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startMinutes: z.coerce.number().int().min(0).max(24 * 60 - 1),
  endMinutes: z.coerce.number().int().min(1).max(24 * 60),
});

const offeringScheduleFieldsSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(3).max(120),
  description: z.string().max(2000).optional(),
  periodType: z.enum(["OPEN", "RESERVED"]).default("OPEN"),
  teacherCap: z.coerce.number().int().min(1).max(1000).optional(),
  invitedStudentProfileIds: z.array(z.string().min(1)).default([]),
  slots: z.array(offeringDaySlotSchema).min(1, "Add at least one weekly time slot"),
  recurrence: offeringRecurrenceSchema,
});

export const offeringSchedulePayloadSchema = offeringScheduleFieldsSchema.superRefine(
  (value, ctx) => {
    const days = value.slots.map((slot) => slot.dayOfWeek);
    if (new Set(days).size !== days.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each day can only appear once",
        path: ["slots"],
      });
    }

    value.slots.forEach((slot, index) => {
      if (slot.endMinutes <= slot.startMinutes) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End time must be after start time",
          path: ["slots", index, "endMinutes"],
        });
      }
    });

    if (value.periodType === "OPEN") {
      if (value.teacherCap == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Class cap is required for open periods",
          path: ["teacherCap"],
        });
      }
      return;
    }

    if (value.invitedStudentProfileIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one invited student",
        path: ["invitedStudentProfileIds"],
      });
    }

    if (value.recurrence.kind === "ONCE" && value.slots.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "One-time events can only use a single time slot",
        path: ["slots"],
      });
    }
  },
);

export type OfferingSchedulePayload = z.infer<typeof offeringSchedulePayloadSchema>;

export class OfferingScheduleConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfferingScheduleConflictError";
  }
}

async function assertSubjectBelongsToTeacher(teacherProfileId: string, subjectId: string) {
  const link = await db.teacherSubject.findUnique({
    where: { teacherProfileId_subjectId: { teacherProfileId, subjectId } },
    select: { subjectId: true },
  });
  if (!link) {
    throw new Error("Pick this subject in your profile before scheduling it.");
  }
}

async function assertOfferingHasNoTimeConflict(
  teacherProfileId: string,
  dayOfWeek: DayOfWeek,
  startMinutes: number,
  endMinutes: number,
  excludeOfferingIds: string[] = [],
) {
  const siblings = await db.classOffering.findMany({
    where: {
      teacherProfileId,
      dayOfWeek,
      active: true,
      ...(excludeOfferingIds.length > 0 ? { id: { notIn: excludeOfferingIds } } : {}),
    },
    include: { subject: { select: { name: true } } },
  });
  const pieces: string[] = [];
  for (const o of siblings) {
    if (intervalsOverlapHalfOpen(startMinutes, endMinutes, o.startMinutes, o.endMinutes)) {
      pieces.push(
        `${o.subject.name}: ${minutesToTime(o.startMinutes)}–${minutesToTime(o.endMinutes)}`,
      );
    }
  }
  if (pieces.length > 0) {
    throw new OfferingScheduleConflictError(
      `This time overlaps another class — ${pieces.join("; ")}`,
    );
  }
}

export async function listInviteableStudentsForTeacher(_teacherUserId: string) {
  return db.studentProfile.findMany({
    select: {
      id: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { user: { name: "asc" } },
    take: 500,
  });
}

async function assertInviteesAreStudents(studentProfileIds: string[]) {
  if (studentProfileIds.length === 0) return;
  const rows = await db.studentProfile.findMany({
    where: { id: { in: studentProfileIds } },
    select: { id: true },
  });
  if (rows.length !== studentProfileIds.length) {
    throw new Error("One or more selected students were not found");
  }
}

/** Ends ACTIVE enrollments for students no longer on the invite list (reserved periods). */
async function dropEnrollmentsForRemovedInvitees(
  tx: Prisma.TransactionClient,
  offeringId: string,
  invitedStudentProfileIds: string[],
) {
  await tx.enrollment.updateMany({
    where: {
      offeringId,
      status: "ACTIVE",
      ...(invitedStudentProfileIds.length > 0
        ? { studentProfileId: { notIn: invitedStudentProfileIds } }
        : {}),
    },
    data: {
      status: "DROPPED",
      droppedAt: new Date(),
    },
  });
}

async function syncOfferingInvites(
  tx: Prisma.TransactionClient,
  offeringId: string,
  studentProfileIds: string[],
) {
  await dropEnrollmentsForRemovedInvitees(tx, offeringId, studentProfileIds);
  await tx.offeringInvite.deleteMany({ where: { offeringId } });
  if (studentProfileIds.length === 0) return;
  await tx.offeringInvite.createMany({
    data: studentProfileIds.map((studentProfileId) => ({
      offeringId,
      studentProfileId,
    })),
    skipDuplicates: true,
  });
}

export async function createOffering(teacherUserId: string, input: CreateOfferingInput) {
  const teacher = await requireTeacher(teacherUserId);
  await assertSubjectBelongsToTeacher(teacher.id, input.subjectId);

  const policy = await getPolicy();
  const isOpen = input.periodType === "OPEN";
  const cap = isOpen
    ? clampTeacherCap(input.teacherCap!, policy.globalClassCap)
    : null;

  if (!isOpen) {
    await assertInviteesAreStudents(input.invitedStudentProfileIds);
  }

  await assertOfferingHasNoTimeConflict(
    teacher.id,
    input.dayOfWeek,
    input.startMinutes,
    input.endMinutes,
  );

  const offering = await db.$transaction(async (tx) => {
    const created = await tx.classOffering.create({
      data: {
        teacherProfileId: teacher.id,
        subjectId: input.subjectId,
        title: input.title,
        description: input.description,
        dayOfWeek: input.dayOfWeek,
        startMinutes: input.startMinutes,
        endMinutes: input.endMinutes,
        periodType: input.periodType,
        teacherCap: cap,
        scheduleGroupId: input.scheduleGroupId ?? null,
      },
    });
    if (!isOpen) {
      await tx.offeringInvite.createMany({
        data: input.invitedStudentProfileIds.map((studentProfileId) => ({
          offeringId: created.id,
          studentProfileId,
        })),
        skipDuplicates: true,
      });
    }
    return created;
  });
  await recomputeProfileCompleted(teacher.id);
  return offering;
}

export const updateOfferingSchema = createOfferingSchema;

export async function updateOffering(
  teacherUserId: string,
  offeringId: string,
  input: CreateOfferingInput,
) {
  const teacher = await requireTeacher(teacherUserId);
  const existing = await db.classOffering.findUnique({
    where: { id: offeringId },
    select: { teacherProfileId: true },
  });
  if (!existing || existing.teacherProfileId !== teacher.id) {
    throw new Error("Offering not found");
  }
  await assertSubjectBelongsToTeacher(teacher.id, input.subjectId);
  const policy = await getPolicy();
  const isOpen = input.periodType === "OPEN";
  const cap = isOpen
    ? clampTeacherCap(input.teacherCap!, policy.globalClassCap)
    : null;

  if (!isOpen) {
    await assertInviteesAreStudents(input.invitedStudentProfileIds);
  }

  await assertOfferingHasNoTimeConflict(
    teacher.id,
    input.dayOfWeek,
    input.startMinutes,
    input.endMinutes,
    [offeringId],
  );

  const updated = await db.$transaction(async (tx) => {
    const row = await tx.classOffering.update({
      where: { id: offeringId },
      data: {
        subjectId: input.subjectId,
        title: input.title,
        description: input.description,
        dayOfWeek: input.dayOfWeek,
        startMinutes: input.startMinutes,
        endMinutes: input.endMinutes,
        periodType: input.periodType,
        teacherCap: cap,
        scheduleGroupId: input.scheduleGroupId ?? null,
      },
    });
    if (isOpen) {
      await tx.offeringInvite.deleteMany({ where: { offeringId } });
    } else {
      await syncOfferingInvites(tx, offeringId, input.invitedStudentProfileIds);
    }
    return row;
  });
  await recomputeProfileCompleted(teacher.id);
  return updated;
}

export async function deleteOffering(teacherUserId: string, offeringId: string) {
  await deleteOfferingSchedule(teacherUserId, offeringId);
}

export async function createOfferingSchedule(
  teacherUserId: string,
  input: OfferingSchedulePayload,
) {
  const teacher = await requireTeacher(teacherUserId);
  await assertSubjectBelongsToTeacher(teacher.id, input.subjectId);

  const slots = sortOfferingDaySlots(input.slots);
  const policy = await getPolicy();
  const isOpen = input.periodType === "OPEN";
  const cap = isOpen
    ? clampTeacherCap(input.teacherCap!, policy.globalClassCap)
    : null;

  if (!isOpen) {
    await assertInviteesAreStudents(input.invitedStudentProfileIds);
  }

  for (const slot of slots) {
    await assertOfferingHasNoTimeConflict(
      teacher.id,
      slot.dayOfWeek,
      slot.startMinutes,
      slot.endMinutes,
    );
  }

  const scheduleGroupId = scheduleGroupIdForSlotCount(slots.length);
  const recurrenceData = recurrenceToDb(
    recurrenceFromInput({
      kind: input.recurrence.kind,
      anchorDate: input.recurrence.anchorDate ?? "",
      ordinal: input.recurrence.ordinal ?? "",
      interval: "",
    }),
  );

  await db.$transaction(async (tx) => {
    for (const slot of slots) {
      const created = await tx.classOffering.create({
        data: {
          teacherProfileId: teacher.id,
          subjectId: input.subjectId,
          title: input.title,
          description: input.description,
          dayOfWeek: slot.dayOfWeek,
          startMinutes: slot.startMinutes,
          endMinutes: slot.endMinutes,
          periodType: input.periodType,
          teacherCap: cap,
          scheduleGroupId,
          ...recurrenceData,
        },
      });
      if (!isOpen) {
        await tx.offeringInvite.createMany({
          data: input.invitedStudentProfileIds.map((studentProfileId) => ({
            offeringId: created.id,
            studentProfileId,
          })),
          skipDuplicates: true,
        });
      }
    }
  });
  await recomputeProfileCompleted(teacher.id);
}

export async function updateOfferingSchedule(
  teacherUserId: string,
  offeringId: string,
  input: OfferingSchedulePayload,
) {
  const teacher = await requireTeacher(teacherUserId);
  const anchor = await db.classOffering.findUnique({
    where: { id: offeringId },
    select: { id: true, teacherProfileId: true, scheduleGroupId: true, dayOfWeek: true },
  });
  if (!anchor || anchor.teacherProfileId !== teacher.id) {
    throw new Error("Offering not found");
  }

  await assertSubjectBelongsToTeacher(teacher.id, input.subjectId);
  const policy = await getPolicy();
  const isOpen = input.periodType === "OPEN";
  const cap = isOpen
    ? clampTeacherCap(input.teacherCap!, policy.globalClassCap)
    : null;

  if (!isOpen) {
    await assertInviteesAreStudents(input.invitedStudentProfileIds);
  }

  const siblings = anchor.scheduleGroupId
    ? await db.classOffering.findMany({
        where: { teacherProfileId: teacher.id, scheduleGroupId: anchor.scheduleGroupId },
        select: { id: true, dayOfWeek: true },
      })
    : [{ id: anchor.id, dayOfWeek: anchor.dayOfWeek }];

  const siblingIds = siblings.map((s) => s.id);
  const slots = sortOfferingDaySlots(input.slots);
  const slotByDay = new Map(slots.map((slot) => [slot.dayOfWeek, slot]));
  const targetDays = slots.map((slot) => slot.dayOfWeek);
  const nextGroupId = scheduleGroupIdForSlotCount(slots.length);

  for (const slot of slots) {
    await assertOfferingHasNoTimeConflict(
      teacher.id,
      slot.dayOfWeek,
      slot.startMinutes,
      slot.endMinutes,
      siblingIds,
    );
  }

  const siblingByDay = new Map(siblings.map((s) => [s.dayOfWeek, s]));
  const toDelete = siblings.filter((s) => !targetDays.includes(s.dayOfWeek));
  const toCreate = targetDays.filter((day) => !siblingByDay.has(day));
  const toUpdate = targetDays.filter((day) => siblingByDay.has(day));

  const sharedData = {
    subjectId: input.subjectId,
    title: input.title,
    description: input.description,
    periodType: input.periodType,
    teacherCap: cap,
    scheduleGroupId: nextGroupId,
    ...recurrenceToDb(
      recurrenceFromInput({
        kind: input.recurrence.kind,
        anchorDate: input.recurrence.anchorDate ?? "",
        ordinal: input.recurrence.ordinal ?? "",
        interval: "",
      }),
    ),
  };

  await db.$transaction(async (tx) => {
    for (const dayOfWeek of toUpdate) {
      const row = siblingByDay.get(dayOfWeek)!;
      const slot = slotByDay.get(dayOfWeek)!;
      await tx.classOffering.update({
        where: { id: row.id },
        data: {
          ...sharedData,
          dayOfWeek,
          startMinutes: slot.startMinutes,
          endMinutes: slot.endMinutes,
        },
      });
      if (isOpen) {
        await tx.offeringInvite.deleteMany({ where: { offeringId: row.id } });
      } else {
        await syncOfferingInvites(tx, row.id, input.invitedStudentProfileIds);
      }
    }

    for (const dayOfWeek of toCreate) {
      const slot = slotByDay.get(dayOfWeek)!;
      const created = await tx.classOffering.create({
        data: {
          teacherProfileId: teacher.id,
          ...sharedData,
          dayOfWeek,
          startMinutes: slot.startMinutes,
          endMinutes: slot.endMinutes,
        },
      });
      if (!isOpen) {
        await tx.offeringInvite.createMany({
          data: input.invitedStudentProfileIds.map((studentProfileId) => ({
            offeringId: created.id,
            studentProfileId,
          })),
          skipDuplicates: true,
        });
      }
    }

    for (const row of toDelete) {
      await tx.classOffering.delete({ where: { id: row.id } });
    }
  });
  await recomputeProfileCompleted(teacher.id);
}

export async function deleteOfferingSchedule(teacherUserId: string, offeringId: string) {
  const teacher = await requireTeacher(teacherUserId);
  const existing = await db.classOffering.findUnique({
    where: { id: offeringId },
    select: { teacherProfileId: true, scheduleGroupId: true },
  });
  if (!existing || existing.teacherProfileId !== teacher.id) {
    throw new Error("Offering not found");
  }

  if (existing.scheduleGroupId) {
    await db.classOffering.deleteMany({
      where: {
        teacherProfileId: teacher.id,
        scheduleGroupId: existing.scheduleGroupId,
      },
    });
  } else {
    await db.classOffering.delete({ where: { id: offeringId } });
  }
  await recomputeProfileCompleted(teacher.id);
}

export async function listTeacherOfferings(teacherUserId: string) {
  const teacher = await db.teacherProfile.findUnique({
    where: { userId: teacherUserId },
  });
  if (!teacher) return [];
  return db.classOffering.findMany({
    where: { teacherProfileId: teacher.id },
    include: {
      subject: true,
      enrollments: { where: { status: "ACTIVE" }, select: { id: true } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { startMinutes: "asc" }],
  });
}

// ---------- Rates ----------

export const upsertTeacherRateSchema = z.object({
  subjectId: z.string().min(1),
  regionCode: z.string().min(2).max(8),
  hourlyRate: z.coerce.number().int().min(0),
});

export async function upsertTeacherRate(
  teacherUserId: string,
  input: z.infer<typeof upsertTeacherRateSchema>,
) {
  const teacher = await requireTeacher(teacherUserId);

  const region = await db.region.findUnique({
    where: { code: input.regionCode },
    include: { minRates: true },
  });
  if (!region) throw new Error("Unknown region");

  const min = region.minRates[0]?.hourlyRate ?? 0;
  assertAtLeastMinRate(input.hourlyRate, min);

  const rate = await db.teacherRate.upsert({
    where: {
      teacherProfileId_subjectId_regionId: {
        teacherProfileId: teacher.id,
        subjectId: input.subjectId,
        regionId: region.id,
      },
    },
    create: {
      teacherProfileId: teacher.id,
      subjectId: input.subjectId,
      regionId: region.id,
      hourlyRate: input.hourlyRate,
    },
    update: { hourlyRate: input.hourlyRate },
  });
  await recomputeProfileCompleted(teacher.id);
  return rate;
}

export const setRateMajorSchema = z.object({
  subjectId: z.string().min(1),
  regionCode: z.string().min(2).max(8),
  hourlyRateMajor: z.coerce.number().min(0).finite(),
});

export async function setTeacherRateMajor(
  teacherUserId: string,
  input: z.infer<typeof setRateMajorSchema>,
) {
  const region = await db.region.findUnique({
    where: { code: input.regionCode },
    select: { currency: true },
  });
  if (!region) throw new Error("Unknown region");
  const smallest = majorToSmallest(input.hourlyRateMajor, region.currency);
  return upsertTeacherRate(teacherUserId, {
    subjectId: input.subjectId,
    regionCode: input.regionCode,
    hourlyRate: smallest,
  });
}

export const addTeacherCourseSchema = z.object({
  subjectId: z.string().min(1, "Choose a subject"),
  regionCode: z.string().min(2).max(8),
  hourlyRateMajor: z.coerce
    .number()
    .finite()
    .min(
      TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MIN,
      `Rate must be at least ${TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MIN}`,
    )
    .max(
      TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MAX,
      `Rate must be at most ${TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MAX.toLocaleString()}`,
    ),
  defaultCap: z.coerce
    .number()
    .int()
    .min(
      TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MIN,
      `Class limit must be at least ${TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MIN}`,
    )
    .max(
      TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MAX,
      `Class limit must be at most ${TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MAX}`,
    ),
  /** When true, save existing course metadata without changing list order. */
  isEdit: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === true || v === "true")
    .default(false),
});

export async function addTeacherCourse(
  teacherUserId: string,
  input: z.infer<typeof addTeacherCourseSchema>,
) {
  const teacher = await requireTeacher(teacherUserId);
  const policy = await getPolicy();

  const subject = await db.subject.findUnique({
    where: { id: input.subjectId },
    select: { id: true },
  });
  if (!subject) throw new Error("Unknown subject");

  const defaultCap = clampTeacherCap(
    Math.min(input.defaultCap, TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MAX),
    policy.globalClassCap,
  );

  const nextSortOrder = input.isEdit
    ? null
    : ((await db.teacherSubject.aggregate({
        where: { teacherProfileId: teacher.id },
        _max: { sortOrder: true },
      }))._max.sortOrder ?? 0) + 1;

  const createData: Prisma.TeacherSubjectUncheckedCreateInput = {
    teacherProfileId: teacher.id,
    subjectId: input.subjectId,
    defaultCap,
    courseDescription: "",
    gradeLevel: "",
    syllabus: "",
    sortOrder: nextSortOrder ?? 0,
  };
  const updateData: Prisma.TeacherSubjectUncheckedUpdateInput = input.isEdit
    ? { defaultCap }
    : { defaultCap, sortOrder: nextSortOrder ?? 0 };

  await db.teacherSubject.upsert({
    where: {
      teacherProfileId_subjectId: { teacherProfileId: teacher.id, subjectId: input.subjectId },
    },
    create: createData,
    update: updateData,
  });

  await setTeacherRateMajor(teacherUserId, {
    subjectId: input.subjectId,
    regionCode: input.regionCode,
    hourlyRateMajor: input.hourlyRateMajor,
  });

  await recomputeProfileCompleted(teacher.id);
}

export const removeTeacherCourseSchema = z.object({
  subjectId: z.string().min(1),
});

export async function removeTeacherCourse(
  teacherUserId: string,
  input: z.infer<typeof removeTeacherCourseSchema>,
) {
  const teacher = await requireTeacher(teacherUserId);

  const link = await db.teacherSubject.findUnique({
    where: {
      teacherProfileId_subjectId: { teacherProfileId: teacher.id, subjectId: input.subjectId },
    },
    select: { subjectId: true },
  });
  if (!link) throw new Error("Course not found");

  const offerings = await db.classOffering.findMany({
    where: { teacherProfileId: teacher.id, subjectId: input.subjectId },
    include: { enrollments: { where: { status: "ACTIVE" }, select: { id: true } } },
  });

  const activeEnrollmentCount = offerings.reduce((n, o) => n + o.enrollments.length, 0);
  if (activeEnrollmentCount > 0) {
    throw new Error(
      "Cannot remove this course while students are enrolled. Cancel enrollments or remove scheduled classes first.",
    );
  }

  await db.$transaction(async (tx) => {
    if (offerings.length > 0) {
      await tx.classOffering.deleteMany({
        where: { teacherProfileId: teacher.id, subjectId: input.subjectId },
      });
    }
    await tx.teacherRate.deleteMany({
      where: { teacherProfileId: teacher.id, subjectId: input.subjectId },
    });
    await tx.teacherSubject.delete({
      where: {
        teacherProfileId_subjectId: { teacherProfileId: teacher.id, subjectId: input.subjectId },
      },
    });
  });

  await recomputeProfileCompleted(teacher.id);
}

export async function removeTeacherRate(
  teacherUserId: string,
  subjectId: string,
  regionCode: string,
) {
  const teacher = await requireTeacher(teacherUserId);
  const region = await db.region.findUnique({
    where: { code: regionCode },
    select: { id: true },
  });
  if (!region) throw new Error("Unknown region");
  await db.teacherRate.deleteMany({
    where: { teacherProfileId: teacher.id, subjectId, regionId: region.id },
  });
  await recomputeProfileCompleted(teacher.id);
}

// ---------- Misc ----------

export async function listSubjects() {
  return db.subject.findMany({ orderBy: { name: "asc" } });
}

async function requireTeacher(teacherUserId: string) {
  const teacher = await db.teacherProfile.findUnique({
    where: { userId: teacherUserId },
  });
  if (!teacher) throw new Error("Teacher profile not found");
  return teacher;
}

export async function recomputeProfileCompleted(teacherProfileId: string) {
  const profile = await db.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    include: {
      user: { select: { image: true, region: { select: { code: true } } } },
      subjects: { select: { subjectId: true } },
      rates: { select: { subjectId: true, region: { select: { code: true } } } },
      offerings: { select: { id: true } },
    },
  });
  if (!profile) return;

  const coursesComplete = isTeacherCoursesPhaseComplete({
    subjectIds: profile.subjects.map((s) => s.subjectId),
    rates: profile.rates.map((r) => ({
      subjectId: r.subjectId,
      regionCode: r.region.code,
    })),
    teacherRegionCode: profile.user.region?.code ?? null,
  });
  const complete =
    Boolean(profile.user.image) &&
    coursesComplete &&
    profile.offerings.length > 0 &&
    profile.bio.trim().length > 0 &&
    String((profile as { spokenLanguages?: string | null; }).spokenLanguages ?? "").trim().length >
    0;
  if (profile.profileCompleted !== complete) {
    await db.teacherProfile.update({
      where: { id: teacherProfileId },
      data: { profileCompleted: complete },
    });
  }
  return complete;
}
