-- CreateTable
CREATE TABLE "TeacherWorkExperience" (
    "id" TEXT NOT NULL,
    "teacherProfileId" TEXT NOT NULL,
    "company" VARCHAR(200) NOT NULL,
    "role" VARCHAR(200) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherWorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherWorkExperience_teacherProfileId_idx" ON "TeacherWorkExperience"("teacherProfileId");

-- AddForeignKey
ALTER TABLE "TeacherWorkExperience" ADD CONSTRAINT "TeacherWorkExperience_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
