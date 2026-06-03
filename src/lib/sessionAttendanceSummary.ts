export interface SessionJoinSummary {
  enrolled: number;
  joined: number;
}

function studentJoined(student: { joinedAt?: Date | string | null }): boolean {
  return student.joinedAt != null;
}

/** Enrolled roster size and students who joined the live class (`joinedAt` set). */
export function summarizeSessionJoins(
  students: ReadonlyArray<{ joinedAt?: Date | string | null }>,
): SessionJoinSummary {
  let joined = 0;
  for (const student of students) {
    if (studentJoined(student)) joined += 1;
  }
  return {
    enrolled: students.length,
    joined,
  };
}

export function formatSessionJoinSummary(summary: SessionJoinSummary): string {
  const enrolled =
    summary.enrolled === 1 ? "1 enrolled" : `${summary.enrolled} enrolled`;
  const joinedLabel =
    summary.joined === 1 ? "1 joined" : `${summary.joined} joined`;
  return `${enrolled} · ${joinedLabel}`;
}
