export type TeacherProfileTabId = "view" | "bio" | "courses" | "schedule" | "payment";

export const TEACHER_PROFILE_EDIT_TABS: TeacherProfileTabId[] = [
  "bio",
  "courses",
  "schedule",
  "payment",
];

export function isTeacherProfileTabId(v: string): v is TeacherProfileTabId {
  return v === "view" || v === "bio" || v === "courses" || v === "schedule" || v === "payment";
}

export function nextTabAfterSave(current: TeacherProfileTabId): TeacherProfileTabId {
  const idx = TEACHER_PROFILE_EDIT_TABS.indexOf(current);
  if (idx === -1 || idx === TEACHER_PROFILE_EDIT_TABS.length - 1) return "view";
  return TEACHER_PROFILE_EDIT_TABS[idx + 1]!;
}
