-- Demo tenure for teacher subjects created before yearsTaught was seeded (1–9 years per row).
UPDATE "TeacherSubject" AS ts
SET "yearsTaught" = sub.years
FROM (
  SELECT
    "teacherProfileId",
    "subjectId",
    1 + (
      ROW_NUMBER() OVER (
        PARTITION BY "teacherProfileId"
        ORDER BY "sortOrder" DESC, "createdAt" DESC, "subjectId" DESC
      )::integer % 9
    ) AS years
  FROM "TeacherSubject"
) AS sub
WHERE
  ts."teacherProfileId" = sub."teacherProfileId"
  AND ts."subjectId" = sub."subjectId"
  AND ts."yearsTaught" = 0;
