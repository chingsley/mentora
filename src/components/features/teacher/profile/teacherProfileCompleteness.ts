import { isTeacherCoursesPhaseComplete } from "@/lib/teacherCoursesCompleteness";
import type { TeacherProfileChecklistItem } from "./TeacherProfileTabs.types";
import {
  TEACHER_PROFILE_EDIT_TABS,
  TEACHER_PROFILE_TAB_LABEL,
  type TeacherProfileEditTabId,
} from "./teacherProfileTabIds";

export interface TeacherProfileCompletenessInput {
  image: string | null;
  bio: string;
  spokenLanguages: string;
  subjectIds: string[];
  offeringsCount: number;
  payoutLegalName: string | null;
  payoutCountryCode: string | null;
  payoutPreferredMethod: string | null;
}

function phaseDone(flags: boolean[]): boolean {
  return flags.length > 0 && flags.every(Boolean);
}

export function buildTeacherProfileChecklist(
  input: TeacherProfileCompletenessInput,
): TeacherProfileChecklistItem[] {
  const phaseComplete: Record<TeacherProfileEditTabId, boolean> = {
    bio: phaseDone([
      Boolean(input.image),
      Boolean(String(input.spokenLanguages ?? "").trim()),
      input.bio.trim().length > 0,
    ]),
    courses: isTeacherCoursesPhaseComplete({
      subjectIds: input.subjectIds,
    }),
    schedule: input.offeringsCount > 0,
    payment: phaseDone([
      Boolean(input.payoutLegalName?.trim()),
      Boolean(input.payoutCountryCode?.trim()),
      Boolean(input.payoutPreferredMethod?.trim()),
    ]),
  };

  return TEACHER_PROFILE_EDIT_TABS.map((tab) => ({
    label: TEACHER_PROFILE_TAB_LABEL[tab],
    done: phaseComplete[tab],
    editTab: tab,
  }));
}
