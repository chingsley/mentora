-- AlterTable: ClassOffering — add `rules` (text) defaulting to empty string.
ALTER TABLE "ClassOffering"
  ADD COLUMN "rules" TEXT NOT NULL DEFAULT '';

-- CreateTable: ClassTestimonial — student feedback per class offering.
CREATE TABLE "ClassTestimonial" (
  "id" TEXT NOT NULL,
  "offeringId" TEXT NOT NULL,
  "studentProfileId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ClassTestimonial_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClassTestimonial_offeringId_studentProfileId_key"
  ON "ClassTestimonial"("offeringId", "studentProfileId");

CREATE INDEX "ClassTestimonial_offeringId_idx"
  ON "ClassTestimonial"("offeringId");

ALTER TABLE "ClassTestimonial"
  ADD CONSTRAINT "ClassTestimonial_offeringId_fkey"
  FOREIGN KEY ("offeringId") REFERENCES "ClassOffering"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassTestimonial"
  ADD CONSTRAINT "ClassTestimonial_studentProfileId_fkey"
  FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
