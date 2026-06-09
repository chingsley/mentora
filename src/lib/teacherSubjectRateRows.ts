import { formatStartingHourlyRate } from "@/lib/offeringHourlyRate";
import { formatPrice } from "@/lib/time";

export interface TeacherSubjectRateRow {
  id: string;
  subjectId: string;
  subjectName: string;
  regionName: string;
  hourlyDisplay: string;
}

export function buildTeacherSubjectRateRows(args: {
  offerings: Array<{
    id: string;
    subjectId: string;
    hourlyRate: number;
    subject: { name: string };
  }>;
  visibleOfferingIds: Set<string>;
  currency: string;
  regionName: string;
}): TeacherSubjectRateRow[] {
  const minBySubject = new Map<string, { subjectName: string; minRate: number }>();

  for (const offering of args.offerings) {
    if (!args.visibleOfferingIds.has(offering.id)) continue;
    if (offering.hourlyRate <= 0) continue;
    const existing = minBySubject.get(offering.subjectId);
    if (!existing) {
      minBySubject.set(offering.subjectId, {
        subjectName: offering.subject.name,
        minRate: offering.hourlyRate,
      });
      continue;
    }
    existing.minRate = Math.min(existing.minRate, offering.hourlyRate);
  }

  return [...minBySubject.entries()]
    .map(([subjectId, row]) => ({
      id: subjectId,
      subjectId,
      subjectName: row.subjectName,
      regionName: args.regionName,
      hourlyDisplay: formatStartingHourlyRate(row.minRate, args.currency),
    }))
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
}

export function minVisibleOfferingHourlyRate(
  offerings: Array<{ id: string; hourlyRate: number }>,
  visibleOfferingIds: Set<string>,
): number | null {
  const rates = offerings
    .filter((o) => visibleOfferingIds.has(o.id) && o.hourlyRate > 0)
    .map((o) => o.hourlyRate);
  if (rates.length === 0) return null;
  return Math.min(...rates);
}

export function formatTeacherPriceSummary(minRate: number | null, currency: string): string {
  if (minRate == null) return "Rates coming soon";
  return `${formatStartingHourlyRate(minRate, currency)}/hr`;
}
