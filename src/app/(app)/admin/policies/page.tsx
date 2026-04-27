import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Muted, PageHeader, PageTitle, PageWrap } from "@/components/ui/primitives";
import { getPolicy, listRegions } from "@/server/policies";
import { minorUnitExponent, smallestToMajor } from "@/lib/money";
import { formatPrice } from "@/lib/time";
import { PolicyForm } from "./PolicyForm";
import { RegionList, RegionRateRow } from "./RegionRateRow";
import { updateRegionMinRateAction } from "./actions";

export const metadata: Metadata = { title: "Platform policies" };

export default async function AdminPoliciesPage() {
  await requireRole("ADMIN");
  const [policy, regions] = await Promise.all([getPolicy(), listRegions()]);

  return (
    <PageWrap>
      <PageHeader>
        <PageTitle>Platform policies</PageTitle>
        <Muted>
          Global controls that apply to every teacher and student on Mentora.
        </Muted>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Global settings</CardTitle>
          <CardDescription>
            Caps, commission, and attendance thresholds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PolicyForm
            initial={{
              globalClassCap: policy.globalClassCap,
              commissionPercent: policy.commissionPercent,
              attendanceThresholdPct: policy.attendanceThresholdPct,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Region minimum rates</CardTitle>
          <CardDescription>
            Teachers in a region cannot price below these floors. Enter hourly
            amounts in normal units (e.g. 15 for USD/EUR, 3500 for NGN). Values
            are stored precisely in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {regions.length === 0 ? (
            <Muted>No regions seeded.</Muted>
          ) : (
            <RegionList>
              {regions.map((r) => {
                const current = r.minRates[0]?.hourlyRate ?? 0;
                return (
                  <RegionRateRow
                    key={r.id}
                    regionId={r.id}
                    regionCode={r.code}
                    regionName={r.name}
                    currency={r.currency}
                    currentLabel={formatPrice(current, r.currency)}
                    defaultMajor={smallestToMajor(current, r.currency)}
                    step={minorUnitExponent(r.currency) === 0 ? 1 : 0.01}
                    action={updateRegionMinRateAction}
                  />
                );
              })}
            </RegionList>
          )}
        </CardContent>
      </Card>
    </PageWrap>
  );
}
