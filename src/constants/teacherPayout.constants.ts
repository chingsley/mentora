export const TEACHER_PAYOUT_METHOD = {
  BANK_TRANSFER: "BANK_TRANSFER",
  STRIPE_CONNECT: "STRIPE_CONNECT",
  OTHER: "OTHER",
} as const;

export type TeacherPayoutMethod =
  (typeof TEACHER_PAYOUT_METHOD)[keyof typeof TEACHER_PAYOUT_METHOD];
