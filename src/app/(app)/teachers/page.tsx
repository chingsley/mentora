import type { Metadata } from "next";
import Link from "next/link";
import type { DayOfWeek } from "@prisma/client";
import { requireSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TeacherCard } from "@/components/features/TeacherCard";
import { parseMajorToSmallest } from "@/lib/money";
import { listSubjects, recommendTeachers, searchTeachers } from "@/server/teachers";
import { listRegions } from "@/server/policies";
import { DAY_LABEL, DAY_ORDER } from "@/lib/time";

export const metadata: Metadata = { title: "Find teachers" };

const VALID_DAYS: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface Props {
  searchParams: Promise<{
    subject?: string;
    region?: string;
    q?: string;
    max?: string;
    day?: string;
    rating?: string;
  }>;
}

type TeacherRow = Awaited<ReturnType<typeof searchTeachers>>[number];

function toCardProps(t: TeacherRow) {
  const firstRate = t.rates[0];
  const days = Array.from(new Set(t.offerings.map((o) => o.dayOfWeek)));
  return {
    id: t.id,
    displayId: t.displayId,
    name: t.user.name,
    headline: t.headline || "Tutor on Mentora",
    image: t.user.image,
    rating: t.avgRating,
    ratingsCount: t.ratingsCount,
    subjectNames: t.subjects.map((s) => s.subject.name),
    regionCode: t.user.region?.code ?? null,
    minRate: firstRate
      ? { hourlyRate: firstRate.hourlyRate, currency: firstRate.region.currency }
      : null,
    daysTaught: days,
  };
}

export default async function TeachersPage({ searchParams }: Props) {
  const session = await requireSession();
  const { subject, region, q, max, day, rating } = await searchParams;

  const regions = await listRegions();
  const maxRegion = region ? regions.find((r) => r.code === region) : undefined;
  const maxCurrency = maxRegion?.currency ?? "USD";
  const maxHourlyRate = parseMajorToSmallest(max, maxCurrency);

  const dayFilter = day && (VALID_DAYS as string[]).includes(day)
    ? (day as DayOfWeek)
    : undefined;
  const parsedRating = rating ? Number(rating) : NaN;
  const minRating =
    Number.isFinite(parsedRating) && parsedRating > 0 ? parsedRating : undefined;

  const [teachers, subjects, recommended] = await Promise.all([
    searchTeachers({
      subjectSlug: subject,
      regionCode: region,
      query: q,
      maxHourlyRate,
      dayOfWeek: dayFilter,
      minRating,
    }),
    listSubjects(),
    session.user.role === "STUDENT" ? recommendTeachers(session.user.id, 6) : [],
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">Find a teacher</h1>
        <p className="text-sm text-muted-foreground">
          Search by name, teacher ID, or subject. Filter by day, price, region,
          and rating.
        </p>
      </div>

      {recommended.length > 0 && !q && !subject && !region && !dayFilter && !minRating ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended for you
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((t) => {
              const props = toCardProps(t);
              return <TeacherCard key={t.id} {...props} />;
            })}
          </div>
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search &amp; filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" method="get">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="font-medium text-header">Search</span>
                <input
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Teacher name, ID, or subject"
                  className="h-10 rounded-md border border-border bg-foreground px-3 text-sm"
                />
              </label>
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
                <span className="font-medium text-header">
                  Max hourly ({maxRegion?.currency ?? "USD"})
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
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-header">Minimum rating</span>
                <select
                  name="rating"
                  defaultValue={rating ?? ""}
                  className="h-10 rounded-md border border-border bg-foreground px-3 text-sm"
                >
                  <option value="">Any</option>
                  <option value="3">3+ stars</option>
                  <option value="4">4+ stars</option>
                  <option value="4.5">4.5+ stars</option>
                </select>
              </label>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-header">Teaches on</legend>
              <div className="flex flex-wrap gap-1.5">
                <DayRadio current={day} value="" label="Any day" />
                {DAY_ORDER.map((d) => (
                  <DayRadio key={d} current={day} value={d} label={DAY_LABEL[d].slice(0, 3)} />
                ))}
              </div>
            </fieldset>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-md bg-header px-4 text-sm font-medium text-white hover:bg-header/90"
              >
                Apply filters
              </button>
              <Link
                href="/teachers"
                className="text-sm text-muted-foreground hover:text-header hover:underline"
              >
                Clear all
              </Link>
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
            {teachers.map((t) => (
              <TeacherCard key={t.id} {...toCardProps(t)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DayRadio({
  current,
  value,
  label,
}: {
  current: string | undefined;
  value: string;
  label: string;
}) {
  const id = `day-${value || "any"}`;
  const isActive = (current ?? "") === value;
  return (
    <>
      <input
        type="radio"
        id={id}
        name="day"
        value={value}
        defaultChecked={isActive}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          isActive
            ? "border-header bg-header text-white"
            : "border-border bg-foreground text-header hover:bg-header/[0.05]"
        }`}
      >
        {label}
      </label>
    </>
  );
}
