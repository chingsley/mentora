"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import {
  createOffering,
  createOfferingSchema,
  deleteOffering as deleteOfferingServer,
  recomputeProfileCompleted,
  removeTeacherRate,
  setRateMajorSchema,
  setSubjectsSchema,
  setTeacherRateMajor,
  setTeacherSubjects,
  updateBioSchema,
  updateOffering,
  updateOfferingSchema,
  updateTeacherBio,
} from "@/server/teachers";
import { timeToMinutes } from "@/lib/time";
import { db } from "@/lib/db";
import { BelowMinimumRateError } from "@/lib/pricing";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function flatten(fieldErrors: Record<string, string[] | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""]),
  );
}

function revalidateTeacher() {
  revalidatePath("/profile");
  revalidatePath("/schedule");
  revalidatePath("/teachers");
  revalidatePath("/dashboard");
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

function parseOfferingForm(formData: FormData) {
  const start = String(formData.get("startTime") ?? "");
  const end = String(formData.get("endTime") ?? "");
  let startMinutes: number;
  let endMinutes: number;
  try {
    startMinutes = timeToMinutes(start);
    endMinutes = timeToMinutes(end);
  } catch {
    return { ok: false as const, error: "Invalid time" };
  }
  return {
    ok: true as const,
    data: {
      subjectId: formData.get("subjectId"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      dayOfWeek: formData.get("dayOfWeek"),
      startMinutes,
      endMinutes,
      teacherCap: formData.get("teacherCap"),
    },
  };
}

export async function createOfferingAction(formData: FormData): Promise<ActionResult> {
  const session = await requireRole("TEACHER");
  const payload = parseOfferingForm(formData);
  if (!payload.ok) return { ok: false, error: payload.error };

  const parsed = createOfferingSchema.safeParse(payload.data);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  try {
    await createOffering(session.user.id, parsed.data);
  } catch (err) {
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

  const parsed = updateOfferingSchema.safeParse(payload.data);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: flatten(parsed.error.flatten().fieldErrors),
    };
  }
  try {
    await updateOffering(session.user.id, offeringId, parsed.data);
  } catch (err) {
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
