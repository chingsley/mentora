import type { TeacherProfileEditTabId } from "./teacherProfileTabIds";

/** Session storage key — cleared when onboarding completes successfully. */
export const TEACHER_SETUP_DISMISS_STORAGE_KEY = "teacher-setup:dismissed";

/** Persisted once the teacher has seen the pre-setup welcome screen. */
export const TEACHER_SETUP_WELCOME_SEEN_STORAGE_KEY = "teacher-setup:welcome-seen";

export const TEACHER_SETUP_QUERY_VALUE = "1";

export const TEACHER_WELCOME_QUERY_VALUE = "1";

export function teacherProfileSetupHref(tab?: string): string {
  const params = new URLSearchParams({ setup: TEACHER_SETUP_QUERY_VALUE });
  if (tab) params.set("tab", tab);
  return `/profile?${params.toString()}`;
}

export function teacherProfileWelcomeHref(): string {
  return `/profile?welcome=${TEACHER_WELCOME_QUERY_VALUE}`;
}

export const TEACHER_SETUP_STEP_COPY: Record<
  TeacherProfileEditTabId,
  { title: string; subtitle: string }
> = {
  bio: {
    title: "Photo & bio",
    subtitle: "Help students recognize you and understand your teaching style.",
  },
  courses: {
    title: "Courses",
    subtitle: "Choose the subjects you teach and your default class size.",
  },
  schedule: {
    title: "Scheduling",
    subtitle: "Add class times and set your hourly rate for each class.",
  },
  payment: {
    title: "Payment details",
    subtitle: "Tell us where to send your earnings when classes are completed.",
  },
};
