-- AlterTable
ALTER TABLE "TeacherProfile" ADD COLUMN "timeZone" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TeacherProfile" ADD COLUMN "spokenLanguages" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TeacherProfile" ADD COLUMN "locationLabel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TeacherProfile" ADD COLUMN "payoutLegalName" VARCHAR(200);
ALTER TABLE "TeacherProfile" ADD COLUMN "payoutCountryCode" VARCHAR(2);
ALTER TABLE "TeacherProfile" ADD COLUMN "payoutPreferredMethod" VARCHAR(64);
ALTER TABLE "TeacherProfile" ADD COLUMN "payoutNotes" TEXT;

-- AlterTable
ALTER TABLE "TeacherSubject" ADD COLUMN "courseDescription" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TeacherSubject" ADD COLUMN "gradeLevel" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TeacherSubject" ADD COLUMN "syllabus" TEXT NOT NULL DEFAULT '';
