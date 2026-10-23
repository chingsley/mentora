import {
  teacherProfileSetupPhaseComplete,
  type TeacherProfileSetupInput,
} from "@/lib/teacherProfileSetup";
import type { TeacherProfileChecklistItem } from "./TeacherProfileTabs.types";
import { TEACHER_PROFILE_TAB_LABEL } from "./teacherProfileTabIds";

export type TeacherProfileCompletenessInput = TeacherProfileSetupInput;

export function buildTeacherProfileChecklist(
  input: TeacherProfileCompletenessInput,
): TeacherProfileChecklistItem[] {
  const phaseComplete = teacherProfileSetupPhaseComplete(input);

  return [
    {
      label: "Photo & bio",
      done: phaseComplete.bio,
      editTab: "view",
      profileSection: input.image ? "about" : "photo",
    },
    {
      label: "Location & languages",
      done: phaseComplete.location,
      editTab: "view",
      profileSection: "photo",
    },
    {
      label: TEACHER_PROFILE_TAB_LABEL.courses,
      done: phaseComplete.courses,
      editTab: "view",
      profileSection: "subjects",
    },
    {
      label: TEACHER_PROFILE_TAB_LABEL.schedule,
      done: phaseComplete.schedule,
      editTab: "view",
      profileSection: "schedule",
    },
  ];
}
