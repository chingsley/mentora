-- Teacher public profile location: structured country + city, keep display label.
ALTER TABLE "TeacherProfile"
  ADD COLUMN "locationCountryCode" VARCHAR(2) NOT NULL DEFAULT '',
  ADD COLUMN "locationCity" TEXT NOT NULL DEFAULT '';

-- Backfill country code from legacy locationLabel when it matches a country name.
UPDATE "TeacherProfile"
SET "locationCountryCode" = CASE
  WHEN trim("locationLabel") ILIKE 'nigeria' THEN 'NG'
  WHEN trim("locationLabel") ILIKE 'brazil' THEN 'BR'
  WHEN trim("locationLabel") ILIKE 'united states' THEN 'US'
  WHEN trim("locationLabel") ILIKE 'united kingdom' THEN 'GB'
  WHEN position(',' in trim("locationLabel")) > 0 THEN ''
  ELSE ''
END
WHERE "locationCountryCode" = '';

-- Backfill city from "City, Country" legacy labels when country is known.
UPDATE "TeacherProfile"
SET
  "locationCity" = trim(split_part(trim("locationLabel"), ',', 1)),
  "locationCountryCode" = CASE
    WHEN trim(split_part(trim("locationLabel"), ',', 2)) ILIKE 'nigeria' THEN 'NG'
    WHEN trim(split_part(trim("locationLabel"), ',', 2)) ILIKE 'brazil' THEN 'BR'
    WHEN trim(split_part(trim("locationLabel"), ',', 2)) ILIKE 'united states' THEN 'US'
    WHEN trim(split_part(trim("locationLabel"), ',', 2)) ILIKE 'united kingdom' THEN 'GB'
    ELSE "locationCountryCode"
  END
WHERE position(',' in trim("locationLabel")) > 0
  AND "locationCity" = '';
