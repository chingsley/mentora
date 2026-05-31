-- Guardian invite fields
ALTER TABLE "GuardianLink" ADD COLUMN "inviteCode" TEXT;
ALTER TABLE "GuardianLink" ADD COLUMN "invitedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX "GuardianLink_inviteCode_key" ON "GuardianLink"("inviteCode");

-- Attendance enums
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');
CREATE TYPE "AttendanceSource" AS ENUM ('AUTO_JOIN', 'TEACHER');

-- Teacher report enums
CREATE TYPE "ReportReason" AS ENUM ('HARASSMENT', 'NO_SHOW', 'INAPPROPRIATE_CONTENT', 'UNPROFESSIONAL', 'OTHER');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWED', 'DISMISSED');

-- Attendance
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "source" "AttendanceSource" NOT NULL,
    "joinedAt" TIMESTAMP(3),
    "markedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Attendance_enrollmentId_sessionDate_key" ON "Attendance"("enrollmentId", "sessionDate");
CREATE INDEX "Attendance_enrollmentId_idx" ON "Attendance"("enrollmentId");

ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Assignments
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "attachmentPath" TEXT,
    "attachmentMime" TEXT,
    "attachmentSize" INTEGER,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Assignment_offeringId_idx" ON "Assignment"("offeringId");
CREATE INDEX "Assignment_teacherProfileId_idx" ON "Assignment"("teacherProfileId");

ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "ClassOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Assignment submissions
CREATE TABLE "AssignmentSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileMime" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" INTEGER,
    "feedback" TEXT,
    "gradedAt" TIMESTAMP(3),
    "gradedByUserId" TEXT,

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_studentProfileId_key" ON "AssignmentSubmission"("assignmentId", "studentProfileId");
CREATE INDEX "AssignmentSubmission_studentProfileId_idx" ON "AssignmentSubmission"("studentProfileId");

ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Teacher reports
CREATE TABLE "TeacherReport" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "reporterRole" "Role" NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TeacherReport_teacherProfileId_idx" ON "TeacherReport"("teacherProfileId");
CREATE INDEX "TeacherReport_status_idx" ON "TeacherReport"("status");

ALTER TABLE "TeacherReport" ADD CONSTRAINT "TeacherReport_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
