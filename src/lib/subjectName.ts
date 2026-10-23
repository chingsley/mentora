import { TEACHER_PROFILE_ADD_COURSE } from "@/constants/teacherProfileCourse.constants";

/** Trim and collapse internal whitespace for subject / course titles. */
export function normalizeSubjectName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function isValidSubjectName(raw: string): boolean {
  const name = normalizeSubjectName(raw);
  return (
    name.length >= TEACHER_PROFILE_ADD_COURSE.SUBJECT_NAME_MIN &&
    name.length <= TEACHER_PROFILE_ADD_COURSE.SUBJECT_NAME_MAX
  );
}

/** URL-safe slug from a display name (not guaranteed unique until deduped in DB). */
export function subjectSlugFromName(name: string): string {
  const base = normalizeSubjectName(name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return base.length > 0 ? base : "subject";
}
