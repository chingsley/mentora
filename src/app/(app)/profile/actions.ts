"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { BelowMinimumRateError } from "@/lib/pricing";
import { revalidateTeacherPaths } from "@/server/revalidateTeacherPaths";
import {
  createOfferingSchedule,
  deleteOffering as deleteOfferingServer,
  offeringSchedulePayloadSchema,
  OfferingScheduleConflictError,
  recomputeProfileCompleted,
  removeTeacherRate,
  saveTeacherBioTab,
  saveTeacherBioTabSchema,
  saveTeacherPayoutTab,
  saveTeacherPayoutTabSchema,
  setRateMajorSchema,
  setSubjectsSchema,
  setTeacherRateMajor,
  setTeacherRegion,
  setTeacherRegionSchema,
  setTeacherSubjects,
  addTeacherCourse,
  addTeacherCourseSchema,
  removeTeacherCourse,
  removeTeacherCourseSchema,
  updateBioSchema,
  updateOfferingSchedule,
  updateTeacherBio,
} from "@/server/teachers";
import {
  setStudentInterests,
  setStudentInterestsSchema,
  updateStudentBio,
  updateStudentBioSchema,
} from "@/server/students";
import { timeToMinutes } from "@/lib/time";
import { db } from "@/lib/db";

export type ActionResult =
  | { ok: true; }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; };

function flatten(fieldErrors: Record<string, string[] | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
  );
}

function revalidateTeacher() {
  revalidateTeacherPaths();
}

export async function clearTeacherAvatarAction(): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const teacher = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!teacher) return { ok: false, error: "Teacher profile not found" };
  await db.user.update({
    where: { id: session.user.id },
    data: { image: null },
  });
  await recomputeProfileCompleted(teacher.id);
  revalidateTeacher();
  return { ok: true };
}

export async function saveBioAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const parsed = updateBioSchema.safeParse({
    headline: formData.get("headline"),
    bio: formData.get("bio") || "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  await updateTeacherBio(session.user.id, parsed.data);
  revalidateTeacher();
  return { ok: true };
}

export async function saveTeacherRegionAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const parsed = setTeacherRegionSchema.safeParse({
    regionCode: formData.get("regionCode"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  try {
    await setTeacherRegion(session.user.id, parsed.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not save region";
    return { ok: false, error: msg };
  }
  revalidateTeacher();
  return { ok: true };
}

export async function saveSubjectsAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");

  const raw = formData.get("subjects");
  let parsedInput: unknown;
  try {
    parsedInput = raw ? JSON.parse(String(raw)) : { subjects: [] };
  } catch {
    return { ok: false, error: "Invalid payload" };
  }
  const parsed = setSubjectsSchema.safeParse(parsedInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  await setTeacherSubjects(session.user.id, parsed.data);
  revalidateTeacher();
  return { ok: true };
}

export async function addTeacherCourseAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const parsed = addTeacherCourseSchema.safeParse({
    subjectId: formData.get("subjectId"),
    defaultCap: formData.get("defaultCap"),
    isEdit: formData.get("isEdit"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  try {
    await addTeacherCourse(session.user.id, parsed.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not add course";
    return { ok: false, error: msg };
  }
  revalidateTeacher();
  return { ok: true };
}

export async function removeTeacherCourseAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const parsed = removeTeacherCourseSchema.safeParse({
    subjectId: formData.get("subjectId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  try {
    await removeTeacherCourse(session.user.id, parsed.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not remove course";
    return { ok: false, error: msg };
  }
  revalidateTeacher();
  return { ok: true };
}

export async function saveRateAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const raw = {
    subjectId: formData.get("subjectId"),
    regionCode: formData.get("regionCode"),
    hourlyRateMajor: formData.get("hourlyRateMajor"),
  };
  const parsed = setRateMajorSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  try {
    await setTeacherRateMajor(session.user.id, parsed.data);
  } catch (err) {
    if (err instanceof BelowMinimumRateError) {
      return {
        ok: false,
        error: err.message,
        fieldErrors: { hourlyRateMajor: err.message },
      };
    }
    throw err;
  }
  revalidateTeacher();
  return { ok: true };
}

export async function clearRateAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const subjectId = String(formData.get("subjectId") ?? "");
  const regionCode = String(formData.get("regionCode") ?? "");
  if (!subjectId || !regionCode) {
    return { ok: false, error: "Missing subject or region" };
  }
  await removeTeacherRate(session.user.id, subjectId, regionCode);
  revalidateTeacher();
  return { ok: true };
}

function flattenFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function parseOfferingForm(formData: FormData) {
  const periodTypeRaw = String(formData.get("periodType") ?? "OPEN");
  const periodType = periodTypeRaw === "RESERVED" ? "RESERVED" : "OPEN";
  const teacherCapRaw = formData.get("teacherCap");
  const teacherCap =
    teacherCapRaw != null && String(teacherCapRaw).trim() !== ""
      ? teacherCapRaw
      : undefined;

  const slots: Array<{
    dayOfWeek: string;
    startMinutes: number;
    endMinutes: number;
  }> = [];

  for (let index = 0; index < 7; index += 1) {
    const dayOfWeek = formData.get(`slots[${index}].dayOfWeek`);
    if (!dayOfWeek) break;

    const start = String(formData.get(`slots[${index}].startTime`) ?? "");
    const end = String(formData.get(`slots[${index}].endTime`) ?? "");
    try {
      slots.push({
        dayOfWeek: String(dayOfWeek),
        startMinutes: timeToMinutes(start),
        endMinutes: timeToMinutes(end),
      });
    } catch {
      return { ok: false as const, error: "Invalid time" };
    }
  }

  if (slots.length === 0) {
    return { ok: false as const, error: "Add at least one weekly time slot" };
  }

  return {
    ok: true as const,
    data: {
      subjectId: formData.get("subjectId"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      hourlyRateMajor: formData.get("hourlyRateMajor"),
      slots,
      periodType,
      teacherCap,
      invitedStudentProfileIds: formData.getAll("invitedStudentProfileIds").map(String),
      recurrence: {
        kind: String(formData.get("recurrenceKind") ?? "WEEKLY"),
        anchorDate: String(formData.get("recurrenceAnchorDate") ?? ""),
        ordinal: (() => {
          const raw = formData.get("recurrenceOrdinal");
          if (raw == null || String(raw).trim() === "") return undefined;
          return Number(raw);
        })(),
        interval: (() => {
          const raw = formData.get("recurrenceInterval");
          if (raw == null || String(raw).trim() === "") return undefined;
          return Number(raw);
        })(),
      },
    },
  };
}

export async function createOfferingAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const payload = parseOfferingForm(formData);
  if (!payload.ok) return { ok: false, error: payload.error };

  const parsed = offeringSchedulePayloadSchema.safeParse(payload.data);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }
  try {
    await createOfferingSchedule(session.user.id, parsed.data);
  } catch (err) {
    if (err instanceof OfferingScheduleConflictError) {
      return { ok: false, error: err.message };
    }
    if (err instanceof BelowMinimumRateError) {
      return {
        ok: false,
        error: err.message,
        fieldErrors: { hourlyRateMajor: err.message },
      };
    }
    const msg = err instanceof Error ? err.message : "Failed to create period";
    return { ok: false, error: msg };
  }
  revalidateTeacher();
  return { ok: true };
}

export async function updateOfferingAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const offeringId = String(formData.get("offeringId") ?? "");
  if (!offeringId) return { ok: false, error: "Missing offering id" };

  const payload = parseOfferingForm(formData);
  if (!payload.ok) return { ok: false, error: payload.error };

  const parsed = offeringSchedulePayloadSchema.safeParse(payload.data);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }
  try {
    await updateOfferingSchedule(session.user.id, offeringId, parsed.data);
  } catch (err) {
    if (err instanceof OfferingScheduleConflictError) {
      return { ok: false, error: err.message };
    }
    if (err instanceof BelowMinimumRateError) {
      return {
        ok: false,
        error: err.message,
        fieldErrors: { hourlyRateMajor: err.message },
      };
    }
    const msg = err instanceof Error ? err.message : "Failed to update period";
    return { ok: false, error: msg };
  }
  revalidateTeacher();
  return { ok: true };
}

export async function deleteOfferingAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const offeringId = String(formData.get("offeringId") ?? "");
  if (!offeringId) return { ok: false, error: "Missing offering id" };
  await deleteOfferingServer(session.user.id, offeringId);
  revalidateTeacher();
  return { ok: true };
}

function revalidateStudent() {
  revalidatePath("/profile");
  revalidatePath("/teachers");
  revalidatePath("/dashboard");
}

export async function saveStudentInterestsAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole("STUDENT");
  const raw = formData.getAll("subjectId").map(String);
  const parsed = setStudentInterestsSchema.safeParse({ subjectIds: raw });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please pick valid subjects.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  await setStudentInterests(session.user.id, parsed.data);
  revalidateStudent();
  return { ok: true };
}

export async function saveStudentBioAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireRole("STUDENT");
  const parsed = updateStudentBioSchema.safeParse({
    bio: formData.get("bio") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  await updateStudentBio(session.user.id, parsed.data);
  revalidateStudent();
  return { ok: true };
}

export async function saveTeacherBioTabAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const parsed = saveTeacherBioTabSchema.safeParse({
    bio: formData.get("bio") || "",
    spokenLanguages: formData.get("spokenLanguages"),
    locationLabel: formData.get("locationLabel") || "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  try {
    await saveTeacherBioTab(session.user.id, parsed.data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not save profile";
    return { ok: false, error: msg };
  }
  revalidateTeacher();
  return { ok: true };
}

export async function saveTeacherPayoutTabAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const parsed = saveTeacherPayoutTabSchema.safeParse({
    payoutLegalName: formData.get("payoutLegalName") || "",
    payoutCountryCode: formData.get("payoutCountryCode") || "",
    payoutPreferredMethod: formData.get("payoutPreferredMethod") || "",
    payoutNotes: formData.get("payoutNotes") || "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  await saveTeacherPayoutTab(session.user.id, parsed.data);
  revalidateTeacher();
  return { ok: true };
}

export async function saveTeacherScheduleTabAction(): Promise<ActionResult> {
  await requireRole("TEACHER");
  revalidateTeacher();
  return { ok: true };
}

export async function refreshCompletenessAction(): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const teacher = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!teacher) return { ok: false, error: "Teacher profile not found" };
  await recomputeProfileCompleted(teacher.id);
  revalidateTeacher();
  return { ok: true };
}
