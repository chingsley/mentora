import { isTeacherCoursesPhaseComplete } from "@/lib/teacherCoursesCompleteness";

/** Onboarding steps (includes location, which is edited under Profile View). */
export const TEACHER_PROFILE_SETUP_PHASES = [
  "bio",
  "location",
  "courses",
  "schedule",
] as const;

export type TeacherProfileSetupPhase = (typeof TEACHER_PROFILE_SETUP_PHASES)[number];

export function isTeacherProfileSetupStepId(v: string): v is TeacherProfileSetupPhase {
  if (v === "payment") return false;
  return (TEACHER_PROFILE_SETUP_PHASES as readonly string[]).includes(v);
}

/** Maps legacy setup URLs to the current step list. */
export function normalizeTeacherProfileSetupStepParam(
  v: string | null,
): TeacherProfileSetupPhase | null {
  if (!v) return null;
  if (v === "payment") return "schedule";
  return isTeacherProfileSetupStepId(v) ? v : null;
}

export function nextTeacherProfileSetupPhase(
  current: TeacherProfileSetupPhase,
): TeacherProfileSetupPhase {
  const idx = TEACHER_PROFILE_SETUP_PHASES.indexOf(current);
  if (idx === -1 || idx === TEACHER_PROFILE_SETUP_PHASES.length - 1) {
    return TEACHER_PROFILE_SETUP_PHASES[TEACHER_PROFILE_SETUP_PHASES.length - 1]!;
  }
  return TEACHER_PROFILE_SETUP_PHASES[idx + 1]!;
}

export interface TeacherProfileSetupInput {
  image: string | null;
  bio: string;
  spokenLanguages: string;
  locationCountryCode: string;
  locationCity: string;
  subjectIds: string[];
  offeringsCount: number;
}

function phaseDone(flags: boolean[]): boolean {
  return flags.length > 0 && flags.every(Boolean);
}

export function isTeacherProfileBioPhaseComplete(input: Pick<
  TeacherProfileSetupInput,
  "image" | "bio"
>): boolean {
  return phaseDone([Boolean(input.image), input.bio.trim().length > 0]);
}

export function isTeacherProfileLocationPhaseComplete(
  input: Pick<TeacherProfileSetupInput, "spokenLanguages" | "locationCountryCode" | "locationCity">,
): boolean {
  return phaseDone([
    Boolean(String(input.spokenLanguages ?? "").trim()),
    /^[A-Z]{2}$/.test(String(input.locationCountryCode ?? "").trim().toUpperCase()),
    Boolean(String(input.locationCity ?? "").trim()),
  ]);
}

export function isTeacherProfileSchedulePhaseComplete(
  input: Pick<TeacherProfileSetupInput, "offeringsCount">,
): boolean {
  return input.offeringsCount > 0;
}

export function teacherProfileSetupPhaseComplete(
  input: TeacherProfileSetupInput,
): Record<TeacherProfileSetupPhase, boolean> {
  return {
    bio: isTeacherProfileBioPhaseComplete(input),
    location: isTeacherProfileLocationPhaseComplete(input),
    courses: isTeacherCoursesPhaseComplete({ subjectIds: input.subjectIds }),
    schedule: isTeacherProfileSchedulePhaseComplete(input),
  };
}

/** True when all onboarding phases are satisfied. */
export function isTeacherProfileSetupComplete(input: TeacherProfileSetupInput): boolean {
  const phases = teacherProfileSetupPhaseComplete(input);
  return TEACHER_PROFILE_SETUP_PHASES.every((tab) => phases[tab]);
}

export function firstIncompleteTeacherProfileSetupPhase(
  input: TeacherProfileSetupInput,
): TeacherProfileSetupPhase {
  const phases = teacherProfileSetupPhaseComplete(input);
  return TEACHER_PROFILE_SETUP_PHASES.find((tab) => !phases[tab]) ?? "bio";
}
