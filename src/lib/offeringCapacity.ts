import type { OfferingPeriodType } from "@prisma/client";
import { computeCapacity, type CapacityStatus } from "@/lib/capacity";

export interface OfferingCapacityInput {
  periodType: OfferingPeriodType;
  globalClassCap: number;
  teacherCap: number | null;
  inviteCount: number;
  currentEnrolled: number;
}

/** Effective capacity for a class period (open vs invite-only reserved). */
export function offeringCapacity(input: OfferingCapacityInput): CapacityStatus {
  if (input.periodType === "RESERVED") {
    const effectiveCap = Math.max(0, input.inviteCount);
    const remaining = Math.max(0, effectiveCap - input.currentEnrolled);
    return {
      effectiveCap,
      remaining,
      isFull: effectiveCap > 0 && remaining === 0,
    };
  }

  const cap = input.teacherCap ?? input.globalClassCap;
  return computeCapacity({
    globalClassCap: input.globalClassCap,
    teacherCap: cap,
    currentEnrolled: input.currentEnrolled,
  });
}

export function isStudentInvitedToOffering(
  invites: { studentProfileId: string }[],
  studentProfileId: string | null,
): boolean {
  if (!studentProfileId) return false;
  return invites.some((i) => i.studentProfileId === studentProfileId);
}
