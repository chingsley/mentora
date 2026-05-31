-- AlterTable
ALTER TABLE "ClassOffering" ADD COLUMN "scheduleGroupId" TEXT;

-- CreateIndex
CREATE INDEX "ClassOffering_scheduleGroupId_idx" ON "ClassOffering"("scheduleGroupId");
