-- AlterTable: User — split name into firstName / lastName
ALTER TABLE "User"
  ADD COLUMN "firstName" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "lastName" TEXT NOT NULL DEFAULT '';

-- Backfill firstName/lastName from existing name (split on first space).
UPDATE "User"
SET
  "firstName" = CASE
    WHEN position(' ' IN "name") > 0 THEN substring("name" FROM 1 FOR position(' ' IN "name") - 1)
    ELSE "name"
  END,
  "lastName" = CASE
    WHEN position(' ' IN "name") > 0 THEN trim(substring("name" FROM position(' ' IN "name") + 1))
    ELSE ''
  END
WHERE "firstName" = '' AND "lastName" = '';

-- AlterTable: TeacherProfile — add displayId / profileCompleted / hoursTaught; headline/bio become defaulted.
ALTER TABLE "TeacherProfile"
  ADD COLUMN "displayId" TEXT,
  ADD COLUMN "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "hoursTaught" INTEGER NOT NULL DEFAULT 0,
  ALTER COLUMN "headline" SET DEFAULT '',
  ALTER COLUMN "bio" SET DEFAULT '';

-- Backfill displayId for any existing teacher profiles:
-- T-YYMMDD-NNA using createdAt as the date and a row-number per day.
WITH numbered AS (
  SELECT
    id,
    to_char("createdAt", 'YYMMDD') AS ymd,
    row_number() OVER (
      PARTITION BY date_trunc('day', "createdAt")
      ORDER BY "createdAt", id
    ) AS rn
  FROM "TeacherProfile"
  WHERE "displayId" IS NULL
)
UPDATE "TeacherProfile" tp
SET "displayId" = 'T-' || n.ymd || '-' || lpad(((n.rn - 1) / 26 + 1)::text, 2, '0') || chr((65 + ((n.rn - 1) % 26))::int)
FROM numbered n
WHERE tp.id = n.id;

-- Enforce NOT NULL + UNIQUE on displayId.
ALTER TABLE "TeacherProfile" ALTER COLUMN "displayId" SET NOT NULL;
CREATE UNIQUE INDEX "TeacherProfile_displayId_key" ON "TeacherProfile"("displayId");

-- AlterTable: TeacherSubject — per-subject default class cap.
ALTER TABLE "TeacherSubject" ADD COLUMN "defaultCap" INTEGER;
