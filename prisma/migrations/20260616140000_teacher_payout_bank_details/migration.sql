ALTER TABLE "TeacherProfile"
  ADD COLUMN "payoutBankName" TEXT,
  ADD COLUMN "payoutBankBranch" TEXT,
  ADD COLUMN "payoutBankAccountNumber" VARCHAR(64),
  ADD COLUMN "payoutBankRoutingNumber" VARCHAR(64);
