import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { getPolicy, listRegions } from "@/server/policies";
import { minorUnitExponent, smallestToMajor } from "@/lib/money";
import { formatPrice } from "@/lib/time";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { PolicyForm } from "./PolicyForm";
import { updateRegionMinRateAction } from "./actions";

export const metadata: Metadata = { title: "Platform policies" };

export default async function AdminPoliciesPage() {
  await requireRole("ADMIN");
  const [policy, regions] = await Promise.all([getPolicy(), listRegions()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">Platform policies</h1>
        <p className="text-sm text-muted-foreground">
          Global controls that apply to every teacher and student on Mentora.
        </p>
      </div>

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
            Teachers in a region cannot price below these floors. Enter hourly amounts in normal
            units (e.g. 15 for USD/EUR, 3500 for NGN). Values are stored precisely in the database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {regions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No regions seeded.</p>
          ) : (
            <ul className="divide-y divide-border">
              {regions.map((r) => {
                const current = r.minRates[0]?.hourlyRate ?? 0;
                return (
                  <li key={r.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-header">
                        {r.name} ({r.code})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Current floor: {formatPrice(current, r.currency)}/hr
                      </p>
                    </div>
                    <form action={updateRegionMinRateAction} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="regionCode" value={r.code} />
                      <label className="sr-only" htmlFor={`min-rate-${r.id}`}>
                        Minimum hourly rate in {r.currency}
                      </label>
                      <input
                        id={`min-rate-${r.id}`}
                        name="hourlyRateMajor"
                        type="number"
                        min={0}
                        step={minorUnitExponent(r.currency) === 0 ? 1 : 0.01}
                        inputMode="decimal"
                        defaultValue={smallestToMajor(current, r.currency)}
                        className="h-9 w-40 rounded-md border border-border bg-foreground px-2 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">{r.currency}/hr</span>
                      <SubmitButton size="sm" className="h-9">
                        Save
                      </SubmitButton>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
