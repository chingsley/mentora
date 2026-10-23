export type TeacherProfileTabId = "view" | "courses" | "schedule";

/** Legacy URL — opens Profile View. */
export const TEACHER_PROFILE_LEGACY_BIO_TAB = "bio";

/** Legacy tab — opens Scheduling. */
export const TEACHER_PROFILE_LEGACY_PAYMENT_TAB = "payment";

export const TEACHER_PROFILE_EDIT_TABS = [
  "courses",
  "schedule",
] as const satisfies readonly TeacherProfileTabId[];

export type TeacherProfileEditTabId = (typeof TEACHER_PROFILE_EDIT_TABS)[number];

export const TEACHER_PROFILE_TAB_LABEL: Record<TeacherProfileEditTabId, string> = {
  courses: "Courses",
  schedule: "Scheduling",
};

export function isTeacherProfileTabId(v: string): v is TeacherProfileTabId {
  return v === "view" || v === "courses" || v === "schedule";
}

export function isTeacherProfileEditTabId(v: string): v is TeacherProfileEditTabId {
  return (TEACHER_PROFILE_EDIT_TABS as readonly string[]).includes(v);
}

/** Legacy outer profile tabs (setup wizard removed — editing is on Profile View sections). */
export const TEACHER_PROFILE_MAINTENANCE_TABS = ["view"] as const satisfies readonly TeacherProfileTabId[];

export type TeacherProfileMaintenanceTabId = (typeof TEACHER_PROFILE_MAINTENANCE_TABS)[number];

export function isTeacherProfileMaintenanceTabId(v: string): v is TeacherProfileMaintenanceTabId {
  return (TEACHER_PROFILE_MAINTENANCE_TABS as readonly string[]).includes(v);
}

export function normalizeTeacherProfileTabParam(v: string | null): string | null {
  if (v === TEACHER_PROFILE_LEGACY_BIO_TAB) return "view";
  if (v === TEACHER_PROFILE_LEGACY_PAYMENT_TAB) return "schedule";
  return v;
}

export function nextTabAfterSave(current: TeacherProfileTabId): TeacherProfileTabId {
  if (current === "view") return "courses";
  const editTabs: readonly TeacherProfileTabId[] = TEACHER_PROFILE_EDIT_TABS;
  const idx = editTabs.indexOf(current);
  if (idx === -1 || idx === editTabs.length - 1) return "view";
  return editTabs[idx + 1]!;
}

export function previousTabBefore(current: TeacherProfileTabId): TeacherProfileTabId {
  if (current === "courses") return "view";
  const editTabs: readonly TeacherProfileTabId[] = TEACHER_PROFILE_EDIT_TABS;
  const idx = editTabs.indexOf(current);
  if (idx <= 0) return "view";
  return editTabs[idx - 1]!;
}
