/** Whether a session falls inside a student's enrollment window (inclusive of enrolledAt). */
export function sessionWithinEnrollment(
  sessionDate: Date,
  enrollment: { enrolledAt: Date; droppedAt: Date | null },
): boolean {
  if (sessionDate.getTime() < enrollment.enrolledAt.getTime()) return false;
  if (enrollment.droppedAt && sessionDate.getTime() > enrollment.droppedAt.getTime()) {
    return false;
  }
  return true;
}
