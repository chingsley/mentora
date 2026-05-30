export interface TeacherCoursesCompletenessInput {
  subjectIds: string[];
  rates: Array<{ subjectId: string; regionCode: string }>;
  teacherRegionCode: string | null;
}

/** True when every taught subject has an hourly rate (in the teacher region when set). */
export function everyTeacherSubjectHasRate({
  subjectIds,
  rates,
  teacherRegionCode,
}: TeacherCoursesCompletenessInput): boolean {
  if (subjectIds.length === 0) return false;

  return subjectIds.every((subjectId) =>
    rates.some(
      (rate) =>
        rate.subjectId === subjectId &&
        (teacherRegionCode == null || rate.regionCode === teacherRegionCode),
    ),
  );
}

export function isTeacherCoursesPhaseComplete(input: TeacherCoursesCompletenessInput): boolean {
  return everyTeacherSubjectHasRate(input);
}
