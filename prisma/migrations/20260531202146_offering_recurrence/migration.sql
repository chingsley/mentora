-- CreateEnum
CREATE TYPE "OfferingRecurrenceKind" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY_NTH', 'MONTHLY_FIRST', 'MONTHLY_LAST', 'MONTHLY_FIRST_AND_LAST', 'ONCE');

-- AlterTable
ALTER TABLE "ClassOffering" ADD COLUMN     "recurrenceAnchorDate" DATE,
ADD COLUMN     "recurrenceKind" "OfferingRecurrenceKind" NOT NULL DEFAULT 'WEEKLY',
ADD COLUMN     "recurrenceOrdinal" INTEGER;
