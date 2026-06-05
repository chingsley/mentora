import "server-only";

import { formatPrice } from "@/lib/time";
import { getPolicy } from "@/server/policies";
import { computeSessionBilling, type BillableEnrollment } from "@/server/sessionBilling";
import { getMyTeacherProfile } from "@/server/teachers";
import { db } from "@/lib/db";
import type { TeacherEarningsSubject, TeacherEarningsSummary } from "@/types/teacherEarnings";

function applyCommission(grossMinor: number, commissionPercent: number): {
  commissionMinor: number;
  netMinor: number;
} {
  const commissionMinor = Math.round((grossMinor * commissionPercent) / 100);
  return { commissionMinor, netMinor: grossMinor - commissionMinor };
}

function emptyEarnings(currency: string, commissionPercent: number): TeacherEarningsSummary {
  const zero = formatPrice(0, currency);
  return {
    currency,
    commissionPercent,
    subjects: [],
    totalSubjects: 0,
    totalSessions: 0,
    totalClassesHeld: 0,
    grossAmountMinor: 0,
    grossAmountFormatted: zero,
    commissionAmountMinor: 0,
    commissionAmountFormatted: zero,
    netAmountMinor: 0,
    netAmountFormatted: zero,
  };
}

async function listTeacherBillableEnrollments(teacherProfileId: string): Promise<BillableEnrollment[]> {
  return db.enrollment.findMany({
    where: { offering: { teacherProfileId } },
    select: {
      id: true,
      enrolledAt: true,
      droppedAt: true,
      offering: {
        select: {
          id: true,
          subjectId: true,
          endMinutes: true,
          subject: { select: { name: true } },
          teacherProfile: {
            select: {
              user: { select: { regionId: true } },
              rates: {
                include: { region: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function getTeacherEarningsSummary(
  userId: string,
): Promise<TeacherEarningsSummary | null> {
  const data = await getMyTeacherProfile(userId);
  if (!data) return null;

  const policy = await getPolicy();
  const commissionPercent = policy.commissionPercent;
  const currency =
    data.profile.user.region?.currency ??
    data.profile.rates[0]?.region.currency ??
    "USD";

  const enrollments = await listTeacherBillableEnrollments(data.profile.id);
  if (enrollments.length === 0) {
    return emptyEarnings(currency, commissionPercent);
  }

  const billing = await computeSessionBilling(enrollments, currency);
  if (billing.totalSubjects === 0) {
    return emptyEarnings(currency, commissionPercent);
  }

  const subjects: TeacherEarningsSubject[] = billing.subjects.map((s) => {
    const { commissionMinor, netMinor } = applyCommission(s.amountMinor, commissionPercent);
    return {
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      rateMinor: s.rateMinor,
      rateFormatted: s.rateFormatted,
      sessionsCompleted: s.sessionsCompleted,
      classesHeld: s.classesHeld,
      grossAmountMinor: s.amountMinor,
      grossAmountFormatted: s.amountFormatted,
      netAmountMinor: netMinor,
      netAmountFormatted: formatPrice(netMinor, currency),
      present: s.present,
      absent: s.absent,
      late: s.late,
    };
  });

  const { commissionMinor, netMinor } = applyCommission(billing.totalAmountMinor, commissionPercent);

  return {
    currency,
    commissionPercent,
    subjects,
    totalSubjects: billing.totalSubjects,
    totalSessions: billing.totalSessions,
    totalClassesHeld: billing.totalClassesHeld,
    grossAmountMinor: billing.totalAmountMinor,
    grossAmountFormatted: billing.totalAmountFormatted,
    commissionAmountMinor: commissionMinor,
    commissionAmountFormatted: formatPrice(commissionMinor, currency),
    netAmountMinor: netMinor,
    netAmountFormatted: formatPrice(netMinor, currency),
  };
}
