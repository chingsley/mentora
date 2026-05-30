-- AlterTable: TeacherSubject — track when a course was added for newest-first display.
ALTER TABLE "TeacherSubject" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
