/** Validation bounds for the teacher profile “add course” form. */
export const TEACHER_PROFILE_ADD_COURSE = {
  HOURLY_RATE_MIN: 5,
  HOURLY_RATE_MAX: 10_000,
  CLASS_LIMIT_MIN: 1,
  CLASS_LIMIT_MAX: 30,
} as const;
