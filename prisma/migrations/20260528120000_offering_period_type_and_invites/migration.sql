-- CreateEnum
CREATE TYPE "OfferingPeriodType" AS ENUM ('OPEN', 'RESERVED');

-- AlterTable
ALTER TABLE "ClassOffering" ADD COLUMN "periodType" "OfferingPeriodType" NOT NULL DEFAULT 'OPEN';
ALTER TABLE "ClassOffering" ALTER COLUMN "teacherCap" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OfferingInvite" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferingInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfferingInvite_studentProfileId_idx" ON "OfferingInvite"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferingInvite_offeringId_studentProfileId_key" ON "OfferingInvite"("offeringId", "studentProfileId");

-- AddForeignKey
ALTER TABLE "OfferingInvite" ADD CONSTRAINT "OfferingInvite_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "ClassOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferingInvite" ADD CONSTRAINT "OfferingInvite_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
