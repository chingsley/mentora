-- AlterEnum
ALTER TYPE "AttendanceSource" ADD VALUE 'SYSTEM';

-- CreateTable
CREATE TABLE "AttendanceChangeLog" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "previousStatus" "AttendanceStatus",
    "newStatus" "AttendanceStatus" NOT NULL,
    "source" "AttendanceSource" NOT NULL,
    "changedByUserId" TEXT,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttendanceChangeLog_attendanceId_createdAt_idx" ON "AttendanceChangeLog"("attendanceId", "createdAt");

-- AddForeignKey
ALTER TABLE "AttendanceChangeLog" ADD CONSTRAINT "AttendanceChangeLog_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceChangeLog" ADD CONSTRAINT "AttendanceChangeLog_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
