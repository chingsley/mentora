-- AlterTable: TeacherSubject — explicit newest-first course ordering.
ALTER TABLE "TeacherSubject" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;
