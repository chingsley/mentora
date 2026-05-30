import "server-only";

import { revalidatePath } from "next/cache";

/** Invalidate cached teacher-facing routes after profile mutations. */
export function revalidateTeacherPaths() {
  revalidatePath("/profile");
  revalidatePath("/schedule");
  revalidatePath("/teachers");
  revalidatePath("/dashboard");
}
