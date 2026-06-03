-- Separate timestamps for teacher vs student session notes (Attendance.updatedAt is shared).

ALTER TABLE "Attendance" ADD COLUMN "teacherNoteUpdatedAt" TIMESTAMP(3);
ALTER TABLE "Attendance" ADD COLUMN "studentNoteUpdatedAt" TIMESTAMP(3);

ALTER TABLE "SessionOccurrence" ADD COLUMN "teacherNoteUpdatedAt" TIMESTAMP(3);
ALTER TABLE "SessionOccurrence" ADD COLUMN "studentNoteUpdatedAt" TIMESTAMP(3);

UPDATE "Attendance"
SET "studentNoteUpdatedAt" = "updatedAt"
WHERE "studentNote" IS NOT NULL AND BTRIM("studentNote") <> '';

UPDATE "Attendance" AS a
SET "teacherNoteUpdatedAt" = sub.latest_at
FROM (
  SELECT "attendanceId", MAX("createdAt") AS latest_at
  FROM "AttendanceChangeLog"
  WHERE "source" = 'TEACHER'
  GROUP BY "attendanceId"
) AS sub
WHERE a."id" = sub."attendanceId"
  AND a."teacherNote" IS NOT NULL
  AND BTRIM(a."teacherNote") <> '';

UPDATE "Attendance"
SET "teacherNoteUpdatedAt" = "updatedAt"
WHERE "teacherNoteUpdatedAt" IS NULL
  AND "teacherNote" IS NOT NULL
  AND BTRIM("teacherNote") <> '';

UPDATE "SessionOccurrence"
SET "teacherNoteUpdatedAt" = "updatedAt"
WHERE "teacherNote" IS NOT NULL AND BTRIM("teacherNote") <> '';

UPDATE "SessionOccurrence"
SET "studentNoteUpdatedAt" = "updatedAt"
WHERE "studentNote" IS NOT NULL AND BTRIM("studentNote") <> '';
