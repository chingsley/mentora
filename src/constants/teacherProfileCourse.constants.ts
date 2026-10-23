/** Validation bounds for the teacher profile “add course” form. */
export const TEACHER_PROFILE_ADD_COURSE = {
  HOURLY_RATE_MIN: 5,
  HOURLY_RATE_MAX: 10_000,
  CLASS_LIMIT_MIN: 1,
  CLASS_LIMIT_MAX: 30,
  SUBJECT_NAME_MIN: 2,
  SUBJECT_NAME_MAX: 120,
  YEARS_TAUGHT_MIN: 0,
  YEARS_TAUGHT_MAX: 60,
} as const;
