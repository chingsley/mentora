-- CreateEnum
CREATE TYPE "ClassSessionStatus" AS ENUM ('LIVE', 'ENDED');

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "status" "ClassSessionStatus" NOT NULL DEFAULT 'LIVE',
    "startedByUserId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_roomName_key" ON "ClassSession"("roomName");

-- CreateIndex
CREATE INDEX "ClassSession_offeringId_status_idx" ON "ClassSession"("offeringId", "status");

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "ClassOffering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
