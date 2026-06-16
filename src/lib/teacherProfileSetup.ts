import { isTeacherCoursesPhaseComplete } from "@/lib/teacherCoursesCompleteness";
import { TEACHER_PAYOUT_METHOD } from "@/constants/teacherPayout.constants";

/** Matches `TEACHER_PROFILE_EDIT_TABS` in teacherProfileTabIds.ts */
export const TEACHER_PROFILE_SETUP_PHASES = ["bio", "courses", "schedule", "payment"] as const;

export type TeacherProfileSetupPhase = (typeof TEACHER_PROFILE_SETUP_PHASES)[number];

export interface TeacherProfileSetupInput {
  image: string | null;
  bio: string;
  spokenLanguages: string;
  subjectIds: string[];
  offeringsCount: number;
  payoutLegalName: string | null;
  payoutCountryCode: string | null;
  payoutPreferredMethod: string | null;
  payoutBankName?: string | null;
  payoutBankBranch?: string | null;
  payoutBankAccountNumber?: string | null;
}

function phaseDone(flags: boolean[]): boolean {
  return flags.length > 0 && flags.every(Boolean);
}

export function isTeacherProfileBioPhaseComplete(input: Pick<
  TeacherProfileSetupInput,
  "image" | "bio" | "spokenLanguages"
>): boolean {
  return phaseDone([
    Boolean(input.image),
    Boolean(String(input.spokenLanguages ?? "").trim()),
    input.bio.trim().length > 0,
  ]);
}

export function isTeacherProfileSchedulePhaseComplete(
  input: Pick<TeacherProfileSetupInput, "offeringsCount">,
): boolean {
  return input.offeringsCount > 0;
}

export function isTeacherProfilePaymentPhaseComplete(
  input: Pick<
    TeacherProfileSetupInput,
    | "payoutLegalName"
    | "payoutCountryCode"
    | "payoutPreferredMethod"
    | "payoutBankName"
    | "payoutBankBranch"
    | "payoutBankAccountNumber"
  >,
): boolean {
  const baseFlags = [
    Boolean(input.payoutLegalName?.trim()),
    Boolean(input.payoutCountryCode?.trim()),
    Boolean(input.payoutPreferredMethod?.trim()),
  ];

  if (input.payoutPreferredMethod === TEACHER_PAYOUT_METHOD.BANK_TRANSFER) {
    return phaseDone([
      ...baseFlags,
      Boolean(input.payoutBankName?.trim()),
      Boolean(input.payoutBankBranch?.trim()),
      Boolean(input.payoutBankAccountNumber?.trim()),
    ]);
  }

  return phaseDone(baseFlags);
}

export function teacherProfileSetupPhaseComplete(
  input: TeacherProfileSetupInput,
): Record<TeacherProfileSetupPhase, boolean> {
  return {
    bio: isTeacherProfileBioPhaseComplete(input),
    courses: isTeacherCoursesPhaseComplete({ subjectIds: input.subjectIds }),
    schedule: isTeacherProfileSchedulePhaseComplete(input),
    payment: isTeacherProfilePaymentPhaseComplete(input),
  };
}

/** True when all onboarding phases (bio, courses, schedule, payment) are satisfied. */
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
