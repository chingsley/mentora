export interface CapacityInputs {
  globalClassCap: number;
  teacherCap: number;
  currentEnrolled: number;
}

export interface CapacityStatus {
  effectiveCap: number;
  remaining: number;
  isFull: boolean;
}

/**
 * Effective cap for a single recurring class period is
 * min(admin global cap, teacher's personal cap).
 * This rule is documented in the Mentora spec.
 */
export function computeCapacity({
  globalClassCap,
  teacherCap,
  currentEnrolled,
}: CapacityInputs): CapacityStatus {
  if (!Number.isInteger(globalClassCap) || globalClassCap < 1) {
    throw new RangeError("globalClassCap must be a positive integer");
  }
  if (!Number.isInteger(teacherCap) || teacherCap < 1) {
    throw new RangeError("teacherCap must be a positive integer");
  }
  if (!Number.isInteger(currentEnrolled) || currentEnrolled < 0) {
    throw new RangeError("currentEnrolled must be a non-negative integer");
  }

  const effectiveCap = Math.min(globalClassCap, teacherCap);
  const remaining = Math.max(0, effectiveCap - currentEnrolled);
  return {
    effectiveCap,
    remaining,
    isFull: remaining === 0,
  };
}

/** Clamp a teacher-provided cap to the admin global cap. */
export function clampTeacherCap(teacherCap: number, globalClassCap: number): number {
  if (teacherCap < 1) return 1;
  return Math.min(teacherCap, globalClassCap);
}

export class EnrollmentFullError extends Error {
  constructor() {
    super("This class period is full");
    this.name = "EnrollmentFullError";
  }
}
