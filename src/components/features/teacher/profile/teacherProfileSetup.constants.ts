import type { TeacherProfileSetupPhase } from "@/lib/teacherProfileSetup";

/** Session storage key — cleared when onboarding completes successfully. */
export const TEACHER_SETUP_DISMISS_STORAGE_KEY = "teacher-setup:dismissed";

/** Persisted once the teacher has seen the pre-setup welcome screen. */
export const TEACHER_SETUP_WELCOME_SEEN_STORAGE_KEY = "teacher-setup:welcome-seen";

export const TEACHER_SETUP_QUERY_VALUE = "1";

export const TEACHER_WELCOME_QUERY_VALUE = "1";

export function teacherProfileHref(profileSection?: string): string {
  if (!profileSection) return "/profile";
  const params = new URLSearchParams({ profileSection });
  return `/profile?${params.toString()}`;
}

/** @deprecated Setup wizard removed — opens profile (optional section). */
export function teacherProfileSetupHref(legacyTab?: string): string {
  if (legacyTab === "schedule") return teacherProfileHref("schedule");
  if (legacyTab === "courses") return teacherProfileHref("subjects");
  if (legacyTab === "location") return teacherProfileHref("photo");
  if (legacyTab === "bio") return teacherProfileHref("about");
  return teacherProfileHref();
}

export function teacherProfileWelcomeHref(): string {
  return teacherProfileHref();
}

export const TEACHER_SETUP_STEP_COPY: Record<
  TeacherProfileSetupPhase,
  { title: string; subtitle: string }
> = {
  bio: {
    title: "Photo & bio",
    subtitle: "Help students recognize you and understand your teaching style.",
  },
  location: {
    title: "Location & languages",
    subtitle: "Country, city, and languages appear on your public profile.",
  },
  courses: {
    title: "Courses",
    subtitle: "Choose the subjects you teach and your default class size.",
  },
  schedule: {
    title: "Scheduling",
    subtitle: "Add class times and set your hourly rate for each class.",
  },
};
