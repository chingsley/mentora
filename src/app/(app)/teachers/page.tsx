import type { Metadata } from "next";
import type { DayOfWeek } from "@prisma/client";
import { requireSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TeacherCard } from "@/components/features/TeacherCard";
import {
  Grid,
  Muted,
  PageHeader,
  PageTitle,
  PageWrap,
  Section,
} from "@/components/ui/primitives";
import { parseMajorToSmallest } from "@/lib/money";
import { listSubjects, recommendTeachers, searchTeachers } from "@/server/teachers";
import { listRegions } from "@/server/policies";
import { TeachersFilters } from "./TeachersFilters";
import { TeachersResults, TeachersSectionHeading, TeachersEmpty } from "./TeachersResults";

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
    <PageWrap>
      <PageHeader>
        <PageTitle>Find a teacher</PageTitle>
        <Muted>
          Search by name, teacher ID, or subject. Filter by day, price, region, and rating.
        </Muted>
      </PageHeader>

      {recommended.length > 0 && !q && !subject && !region && !dayFilter && !minRating ? (
        <Section>
          <TeachersSectionHeading>Recommended for you</TeachersSectionHeading>
          <Grid $smCols={2} $mdCols={3} $gap="FOUR">
            {recommended.map((t) => {
              const props = toCardProps(t);
              return <TeacherCard key={t.id} {...props} />;
            })}
          </Grid>
        </Section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Search &amp; filters</CardTitle>
        </CardHeader>
        <CardContent>
          <TeachersFilters
            q={q}
            subject={subject}
            region={region}
            max={max}
            day={day}
            rating={rating}
            subjects={subjects}
            regions={regions}
            maxRegion={maxRegion}
          />
        </CardContent>
      </Card>

      <Section>
        <Muted>
          {teachers.length} teacher{teachers.length === 1 ? "" : "s"} found.
        </Muted>
        {teachers.length === 0 ? (
          <TeachersEmpty>
            No teachers match these filters. Try widening your search.
          </TeachersEmpty>
        ) : (
          <TeachersResults>
            {teachers.map((t) => (
              <TeacherCard key={t.id} {...toCardProps(t)} />
            ))}
          </TeachersResults>
        )}
      </Section>
    </PageWrap>
  );
}
