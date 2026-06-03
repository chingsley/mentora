-- AlterEnum
ALTER TYPE "AttendanceSource" ADD VALUE 'STUDENT';

-- CreateEnum
CREATE TYPE "SessionOutcome" AS ENUM ('HELD', 'NOT_HELD');

-- CreateEnum
CREATE TYPE "SessionNotHeldReason" AS ENUM ('TEACHER_CANCELED', 'TEACHER_UNAVAILABLE', 'STUDENT_REQUEST', 'TECHNICAL_ISSUE', 'OTHER');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN "teacherNote" TEXT,
ADD COLUMN "studentNote" TEXT;

-- CreateTable
CREATE TABLE "SessionOccurrence" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "outcome" "SessionOutcome" NOT NULL DEFAULT 'HELD',
    "notHeldReason" "SessionNotHeldReason",
    "teacherNote" TEXT,
    "studentNote" TEXT,
    "markedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionOccurrence_offeringId_idx" ON "SessionOccurrence"("offeringId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionOccurrence_offeringId_sessionDate_key" ON "SessionOccurrence"("offeringId", "sessionDate");

-- AddForeignKey
ALTER TABLE "SessionOccurrence" ADD CONSTRAINT "SessionOccurrence_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "ClassOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
