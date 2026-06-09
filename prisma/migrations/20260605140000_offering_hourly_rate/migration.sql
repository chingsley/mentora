-- Per-class hourly rate (replaces subject-level TeacherRate for billing and display).

ALTER TABLE "ClassOffering" ADD COLUMN "hourlyRate" INTEGER NOT NULL DEFAULT 0;

-- Backfill from the teacher's subject rate in their billing region, then any subject rate, then region minimum.
UPDATE "ClassOffering" AS co
SET "hourlyRate" = COALESCE(
  (
    SELECT tr."hourlyRate"
    FROM "TeacherRate" AS tr
    INNER JOIN "TeacherProfile" AS tp ON tp."id" = co."teacherProfileId"
    INNER JOIN "User" AS u ON u."id" = tp."userId"
    WHERE tr."teacherProfileId" = co."teacherProfileId"
      AND tr."subjectId" = co."subjectId"
      AND (u."regionId" IS NULL OR tr."regionId" = u."regionId")
    ORDER BY CASE WHEN u."regionId" IS NOT NULL AND tr."regionId" = u."regionId" THEN 0 ELSE 1 END
    LIMIT 1
  ),
  (
    SELECT tr."hourlyRate"
    FROM "TeacherRate" AS tr
    WHERE tr."teacherProfileId" = co."teacherProfileId"
      AND tr."subjectId" = co."subjectId"
    ORDER BY tr."hourlyRate" ASC
    LIMIT 1
  ),
  (
    SELECT rmr."hourlyRate"
    FROM "RegionMinRate" AS rmr
    INNER JOIN "TeacherProfile" AS tp ON tp."id" = co."teacherProfileId"
    INNER JOIN "User" AS u ON u."id" = tp."userId"
    WHERE u."regionId" IS NOT NULL
      AND rmr."regionId" = u."regionId"
    LIMIT 1
  ),
  0
);
