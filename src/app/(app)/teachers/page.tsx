import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TeacherCard } from "@/components/features/TeacherCard";
import { parseMajorToSmallest } from "@/lib/money";
import { listSubjects, searchTeachers } from "@/server/teachers";
import { listRegions } from "@/server/policies";

export const metadata: Metadata = { title: "Find teachers" };

interface Props {
  searchParams: Promise<{
    subject?: string;
    region?: string;
    q?: string;
    max?: string;
  }>;
}

export default async function TeachersPage({ searchParams }: Props) {
  await requireSession();
  const { subject, region, q, max } = await searchParams;

  const regions = await listRegions();
  const maxRegion = region ? regions.find((r) => r.code === region) : undefined;
  const maxCurrency = maxRegion?.currency ?? "USD";
  const maxHourlyRate = parseMajorToSmallest(max, maxCurrency);

  const [teachers, subjects] = await Promise.all([
    searchTeachers({
      subjectSlug: subject,
      regionCode: region,
      query: q,
      maxHourlyRate,
    }),
    listSubjects(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">Find a teacher</h1>
        <p className="text-sm text-muted-foreground">
          Filter by subject, region, and price.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-4" method="get">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-header">Subject</span>
              <select
                name="subject"
                defaultValue={subject ?? ""}
                className="h-10 rounded-md border border-border bg-foreground px-3 text-sm"
              >
                <option value="">Any</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-header">Region</span>
              <select
                name="region"
                defaultValue={region ?? ""}
                className="h-10 rounded-md border border-border bg-foreground px-3 text-sm"
              >
                <option value="">Any</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-header">Search</span>
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Teacher name"
                className="h-10 rounded-md border border-border bg-foreground px-3 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-header">
                Max hourly ({maxRegion?.currency ?? "USD"} major units)
              </span>
              <input
                name="max"
                defaultValue={max ?? ""}
                placeholder={maxRegion ? `e.g. ${maxRegion.currency === "NGN" ? "5000" : "25"}` : "e.g. 25"}
                inputMode="decimal"
                step="0.01"
                min={0}
                className="h-10 rounded-md border border-border bg-foreground px-3 text-sm"
              />
            </label>
            <div className="sm:col-span-4">
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
              >
                Apply filters
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section>
        <p className="mb-3 text-sm text-muted-foreground">
          {teachers.length} teacher{teachers.length === 1 ? "" : "s"} found.
        </p>
        {teachers.length === 0 ? (
          <p className="rounded-xl bg-foreground p-8 text-center text-sm text-muted-foreground ring-1 ring-black/5">
            No teachers match these filters. Try widening your search.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((t) => {
              const firstRate = t.rates[0];
              return (
                <TeacherCard
                  key={t.id}
                  id={t.id}
                  name={t.user.name}
                  headline={t.headline || "Tutor on Mentora"}
                  rating={t.avgRating}
                  ratingsCount={t.ratingsCount}
                  subjectNames={t.subjects.map((s) => s.subject.name)}
                  regionCode={t.user.region?.code ?? null}
                  minRate={
                    firstRate
                      ? { hourlyRate: firstRate.hourlyRate, currency: firstRate.region.currency }
                      : null
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
