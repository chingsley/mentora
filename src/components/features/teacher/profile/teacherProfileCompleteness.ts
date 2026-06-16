import { isTeacherCoursesPhaseComplete } from "@/lib/teacherCoursesCompleteness";
import {
  teacherProfileSetupPhaseComplete,
  type TeacherProfileSetupInput,
} from "@/lib/teacherProfileSetup";
import type { TeacherProfileChecklistItem } from "./TeacherProfileTabs.types";
import {
  TEACHER_PROFILE_EDIT_TABS,
  TEACHER_PROFILE_TAB_LABEL,
  type TeacherProfileEditTabId,
} from "./teacherProfileTabIds";

export type TeacherProfileCompletenessInput = TeacherProfileSetupInput;

export function buildTeacherProfileChecklist(
  input: TeacherProfileCompletenessInput,
): TeacherProfileChecklistItem[] {
  const phaseComplete = teacherProfileSetupPhaseComplete(input);

  return TEACHER_PROFILE_EDIT_TABS.map((tab) => ({
    label: TEACHER_PROFILE_TAB_LABEL[tab],
    done: phaseComplete[tab as TeacherProfileEditTabId],
    editTab: tab,
  }));
}
