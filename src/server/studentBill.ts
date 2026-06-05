import "server-only";

import { listStudentEnrollments } from "@/server/enrollments";
import {
  computeSessionBilling,
  rateForBillableEnrollment,
  type BillableEnrollment,
} from "@/server/sessionBilling";
import { getMyStudentProfile } from "@/server/students";
import type { StudentBillSubject, StudentBillSummary } from "@/types/studentDashboard";

export { rateForBillableEnrollment as rateForEnrollment };

function toStudentBillSummary(
  billing: Awaited<ReturnType<typeof computeSessionBilling>>,
): StudentBillSummary {
  return {
    currency: billing.currency,
    totalSubjects: billing.totalSubjects,
    totalSessions: billing.totalSessions,
    totalAmountMinor: billing.totalAmountMinor,
    totalAmountFormatted: billing.totalAmountFormatted,
    subjects: billing.subjects.map(
      (s): StudentBillSubject => ({
        subjectId: s.subjectId,
        subjectName: s.subjectName,
        rateMinor: s.rateMinor,
        rateFormatted: s.rateFormatted,
        sessionsCompleted: s.sessionsCompleted,
        amountMinor: s.amountMinor,
        amountFormatted: s.amountFormatted,
        present: s.present,
        absent: s.absent,
        late: s.late,
      }),
    ),
  };
}

export async function getStudentBillSummary(userId: string): Promise<StudentBillSummary | null> {
  const profile = await getMyStudentProfile(userId);
  if (!profile) return null;

  const enrollments = await listStudentEnrollments(userId);
  const currency =
    profile.user.region?.currency ??
    enrollments[0]?.offering.teacherProfile.rates[0]?.region.currency ??
    "USD";

  const billing = await computeSessionBilling(enrollments as BillableEnrollment[], currency);
  return toStudentBillSummary(billing);
}
