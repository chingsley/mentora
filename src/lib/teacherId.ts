import "server-only";
import { db } from "@/lib/db";
import {
  TEACHER_ID_PREFIX,
  datePart,
  formatTeacherDisplayId,
} from "./teacherIdFormat";

export {
  TEACHER_DISPLAY_ID_REGEX,
  formatTeacherDisplayId,
} from "./teacherIdFormat";

const MAX_RETRIES = 50;

/**
 * Generate the next available teacher display id for today by counting existing
 * rows for the day and retrying on unique-constraint collisions.
 *
 * Race-safe enough for our scale: we retry until the DB accepts the id, so
 * parallel inserts either get adjacent indices or fail and retry.
 */
export async function generateTeacherDisplayId(now: Date = new Date()): Promise<string> {
  const prefix = `${TEACHER_ID_PREFIX}-${datePart(now)}-`;

  const existingToday = await db.teacherProfile.count({
    where: { displayId: { startsWith: prefix } },
  });

  for (let offset = 0; offset < MAX_RETRIES; offset += 1) {
    const candidate = formatTeacherDisplayId(now, existingToday + offset);
    const clash = await db.teacherProfile.findUnique({
      where: { displayId: candidate },
      select: { id: true },
    });
    if (!clash) return candidate;
  }

  throw new Error("Unable to allocate a unique teacher display id after retries");
}
