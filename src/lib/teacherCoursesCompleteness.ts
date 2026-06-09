export interface TeacherCoursesCompletenessInput {
  subjectIds: string[];
}

/** True when the teacher has declared at least one subject they teach. */
export function isTeacherCoursesPhaseComplete({ subjectIds }: TeacherCoursesCompletenessInput): boolean {
  return subjectIds.length > 0;
}
