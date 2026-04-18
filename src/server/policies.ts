import "server-only";
import { z } from "zod";
import { majorToSmallest } from "@/lib/money";
import { db } from "@/lib/db";

export const SINGLETON_POLICY_ID = "singleton";

export async function getPolicy() {
  let policy = await db.platformPolicy.findUnique({ where: { id: SINGLETON_POLICY_ID } });
  if (!policy) {
    policy = await db.platformPolicy.create({ data: { id: SINGLETON_POLICY_ID } });
  }
  return policy;
}

export const updatePolicySchema = z.object({
  globalClassCap: z.coerce.number().int().min(1).max(1000),
  commissionPercent: z.coerce.number().int().min(0).max(50),
  attendanceThresholdPct: z.coerce.number().int().min(10).max(100),
});

export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;

export async function updatePolicy(input: UpdatePolicyInput) {
  await getPolicy();
  return db.platformPolicy.update({
    where: { id: SINGLETON_POLICY_ID },
    data: input,
  });
}

export async function listRegions() {
  return db.region.findMany({
    orderBy: { name: "asc" },
    include: { minRates: true },
  });
}

/** Form/query: hourly rate in major units (e.g. 15 USD, 3500 NGN). */
export const upsertRegionMinRateFormSchema = z.object({
  regionCode: z.string().min(2).max(8),
  hourlyRateMajor: z.coerce.number().min(0).finite(),
});

export type UpsertRegionMinRateFormInput = z.infer<typeof upsertRegionMinRateFormSchema>;

export async function upsertRegionMinRateFromMajor(input: UpsertRegionMinRateFormInput) {
  const region = await db.region.findUnique({ where: { code: input.regionCode } });
  if (!region) throw new Error(`Unknown region: ${input.regionCode}`);
  const hourlyRate = majorToSmallest(input.hourlyRateMajor, region.currency);
  return db.regionMinRate.upsert({
    where: { regionId: region.id },
    create: { regionId: region.id, hourlyRate },
    update: { hourlyRate },
  });
}
