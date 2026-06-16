import { BILLING_CURRENCY_OPTIONS } from "@/constants/billingCurrency.constants";
import type { TeacherProfileTabsProps } from "@/components/features/teacher/profile/TeacherProfileTabs.types";
import { TEACHER_PROFILE_ADD_COURSE } from "@/constants/teacherProfileCourse.constants";

type RateRegion = TeacherProfileTabsProps["rateRegions"][number];

export function buildScheduleCurrencyOptions(
  rateRegions: RateRegion[],
): Array<{ value: string; label: string }> {
  const optionMap = new Map<string, string>();

  for (const option of BILLING_CURRENCY_OPTIONS) {
    optionMap.set(option.value, option.label);
  }

  for (const region of rateRegions) {
    if (!optionMap.has(region.currency)) {
      optionMap.set(region.currency, region.currency);
    }
  }

  return Array.from(optionMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

export function resolveRegionCodeForCurrency(
  currency: string,
  rateRegions: RateRegion[],
  teacherRegionCode: string | null,
): string | null {
  const teacherRegion = teacherRegionCode
    ? rateRegions.find((region) => region.code === teacherRegionCode)
    : undefined;
  if (teacherRegion?.currency === currency) return teacherRegion.code;

  return rateRegions.find((region) => region.currency === currency)?.code ?? null;
}

export function minHourlyRateMajorForCurrency(
  currency: string,
  rateRegions: RateRegion[],
): number {
  const region = rateRegions.find((item) => item.currency === currency);
  return Math.max(
    TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MIN,
    Math.ceil(region?.minMajor ?? TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MIN),
  );
}
