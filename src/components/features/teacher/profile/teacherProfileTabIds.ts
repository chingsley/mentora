export type TeacherProfileTabId = "view" | "bio" | "courses" | "schedule" | "payment";

export const TEACHER_PROFILE_EDIT_TABS = [
  "bio",
  "courses",
  "schedule",
  "payment",
] as const satisfies readonly TeacherProfileTabId[];

export type TeacherProfileEditTabId = (typeof TEACHER_PROFILE_EDIT_TABS)[number];

export const TEACHER_PROFILE_TAB_LABEL: Record<TeacherProfileEditTabId, string> = {
  bio: "Photo & Bio",
  courses: "Courses",
  schedule: "Scheduling",
  payment: "Payment Details",
};

export function isTeacherProfileTabId(v: string): v is TeacherProfileTabId {
  return v === "view" || v === "bio" || v === "courses" || v === "schedule" || v === "payment";
}

export function isTeacherProfileEditTabId(v: string): v is TeacherProfileEditTabId {
  return (TEACHER_PROFILE_EDIT_TABS as readonly string[]).includes(v);
}

/** Tabs shown on `/profile` after onboarding is complete. */
export const TEACHER_PROFILE_MAINTENANCE_TABS = ["view", "bio"] as const satisfies readonly TeacherProfileTabId[];

export type TeacherProfileMaintenanceTabId = (typeof TEACHER_PROFILE_MAINTENANCE_TABS)[number];

export function isTeacherProfileMaintenanceTabId(v: string): v is TeacherProfileMaintenanceTabId {
  return v === "view" || v === "bio";
}

export function nextTabAfterSave(current: TeacherProfileTabId): TeacherProfileTabId {
  const editTabs: readonly TeacherProfileTabId[] = TEACHER_PROFILE_EDIT_TABS;
  const idx = editTabs.indexOf(current);
  if (idx === -1 || idx === editTabs.length - 1) return "view";
  return editTabs[idx + 1]!;
}

export function previousTabBefore(current: TeacherProfileTabId): TeacherProfileTabId {
  const editTabs: readonly TeacherProfileTabId[] = TEACHER_PROFILE_EDIT_TABS;
  const idx = editTabs.indexOf(current);
  if (idx <= 0) return "view";
  return editTabs[idx - 1]!;
}
