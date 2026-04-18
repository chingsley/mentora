import "server-only";
import { z } from "zod";
import { DayOfWeek } from "@prisma/client";
import { db } from "@/lib/db";
import { clampTeacherCap } from "@/lib/capacity";
import { assertAtLeastMinRate } from "@/lib/pricing";
import { majorToSmallest } from "@/lib/money";
import { getPolicy } from "./policies";

export interface TeacherSearchFilters {
  subjectSlug?: string;
  regionCode?: string;
  query?: string;
  maxHourlyRate?: number;
}

export async function searchTeachers(filters: TeacherSearchFilters) {
  const { subjectSlug, regionCode, query, maxHourlyRate } = filters;
  return db.teacherProfile.findMany({
    where: {
      user: {
        AND: [
          query
            ? { OR: [{ name: { contains: query, mode: "insensitive" } }] }
            : {},
          regionCode ? { region: { code: regionCode } } : {},
        ],
      },
      subjects: subjectSlug ? { some: { subject: { slug: subjectSlug } } } : undefined,
      rates:
        maxHourlyRate !== undefined
          ? { some: { hourlyRate: { lte: maxHourlyRate } } }
          : undefined,
    },
    include: {
      user: { select: { id: true, name: true, image: true, region: true } },
      subjects: { include: { subject: true } },
      rates: { include: { region: true, subject: true } },
    },
    orderBy: [{ avgRating: "desc" }, { createdAt: "desc" }],
    take: 50,
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
        },
        orderBy: [{ dayOfWeek: "asc" }, { startMinutes: "asc" }],
      },
    },
  });
}

// ---------- My teacher profile (self view) ----------

export async function getMyTeacherProfile(teacherUserId: string) {
  const profile = await db.teacherProfile.findUnique({
    where: { userId: teacherUserId },
    include: {
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
      subjects: { include: { subject: true } },
      rates: { include: { subject: true, region: true } },
      offerings: {
        include: {
          subject: true,
          enrollments: { where: { status: "ACTIVE" }, select: { id: true } },
        },
        orderBy: [{ dayOfWeek: "asc" }, { startMinutes: "asc" }],
      },
    },
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

// ---------- Subjects ----------

export const setSubjectsSchema = z.object({
  subjects: z
    .array(
      z.object({
        subjectId: z.string().min(1),
        defaultCap: z.coerce.number().int().min(1).max(1000),
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

  const uniq = new Map<string, number>();
  for (const s of input.subjects) {
    uniq.set(s.subjectId, clampTeacherCap(s.defaultCap, policy.globalClassCap));
  }

  await db.$transaction(async (tx) => {
    const existing = await tx.teacherSubject.findMany({
      where: { teacherProfileId: teacher.id },
      select: { subjectId: true },
    });
    const existingIds = new Set(existing.map((e) => e.subjectId));
    const newIds = new Set(uniq.keys());

    const toDelete = [...existingIds].filter((id) => !newIds.has(id));
    if (toDelete.length > 0) {
      await tx.teacherSubject.deleteMany({
        where: { teacherProfileId: teacher.id, subjectId: { in: toDelete } },
      });
    }

    for (const [subjectId, defaultCap] of uniq) {
      await tx.teacherSubject.upsert({
        where: { teacherProfileId_subjectId: { teacherProfileId: teacher.id, subjectId } },
        create: { teacherProfileId: teacher.id, subjectId, defaultCap },
        update: { defaultCap },
      });
    }
  });

  await recomputeProfileCompleted(teacher.id);
}

// ---------- Offerings (schedule) ----------

export const createOfferingSchema = z
  .object({
    subjectId: z.string().min(1),
    title: z.string().min(3).max(120),
    description: z.string().max(2000).optional(),
    dayOfWeek: z.nativeEnum(DayOfWeek),
    startMinutes: z.coerce.number().int().min(0).max(24 * 60 - 1),
    endMinutes: z.coerce.number().int().min(1).max(24 * 60),
    teacherCap: z.coerce.number().int().min(1).max(1000),
  })
  .refine((v) => v.endMinutes > v.startMinutes, {
    message: "End time must be after start time",
    path: ["endMinutes"],
  });

export type CreateOfferingInput = z.infer<typeof createOfferingSchema>;

async function assertSubjectBelongsToTeacher(teacherProfileId: string, subjectId: string) {
  const link = await db.teacherSubject.findUnique({
    where: { teacherProfileId_subjectId: { teacherProfileId, subjectId } },
    select: { subjectId: true },
  });
  if (!link) {
    throw new Error("Pick this subject in your profile before scheduling it.");
  }
}

export async function createOffering(teacherUserId: string, input: CreateOfferingInput) {
  const teacher = await requireTeacher(teacherUserId);
  await assertSubjectBelongsToTeacher(teacher.id, input.subjectId);

  const policy = await getPolicy();
  const cap = clampTeacherCap(input.teacherCap, policy.globalClassCap);

  const offering = await db.classOffering.create({
    data: {
      teacherProfileId: teacher.id,
      subjectId: input.subjectId,
      title: input.title,
      description: input.description,
      dayOfWeek: input.dayOfWeek,
      startMinutes: input.startMinutes,
      endMinutes: input.endMinutes,
      teacherCap: cap,
    },
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
  const cap = clampTeacherCap(input.teacherCap, policy.globalClassCap);

  return db.classOffering.update({
    where: { id: offeringId },
    data: {
      subjectId: input.subjectId,
      title: input.title,
      description: input.description,
      dayOfWeek: input.dayOfWeek,
      startMinutes: input.startMinutes,
      endMinutes: input.endMinutes,
      teacherCap: cap,
    },
  });
}

export async function deleteOffering(teacherUserId: string, offeringId: string) {
  const teacher = await requireTeacher(teacherUserId);
  const existing = await db.classOffering.findUnique({
    where: { id: offeringId },
    select: { teacherProfileId: true },
  });
  if (!existing || existing.teacherProfileId !== teacher.id) {
    throw new Error("Offering not found");
  }
  await db.classOffering.delete({ where: { id: offeringId } });
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
      user: { select: { image: true } },
      subjects: { select: { subjectId: true } },
      rates: { select: { id: true } },
      offerings: { select: { id: true } },
    },
  });
  if (!profile) return;
  const complete =
    Boolean(profile.user.image) &&
    profile.subjects.length > 0 &&
    profile.rates.length > 0 &&
    profile.offerings.length > 0 &&
    profile.headline.trim().length > 0;
  if (profile.profileCompleted !== complete) {
    await db.teacherProfile.update({
      where: { id: teacherProfileId },
      data: { profileCompleted: complete },
    });
  }
  return complete;
}
