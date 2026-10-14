import type { TeacherPublicProfileWorkExperience } from "@/types/teacherPublicProfileWorkExperience";

export function mapTeacherWorkExperiencesForPublicProfile(
  rows: ReadonlyArray<{
    id: string;
    company: string;
    role: string;
    startDate: Date;
    endDate: Date | null;
  }>,
): TeacherPublicProfileWorkExperience[] {
  return rows.map((row) => ({
    id: row.id,
    company: row.company,
    role: row.role,
    startDate: row.startDate.toISOString(),
    endDate: row.endDate?.toISOString() ?? null,
  }));
}
