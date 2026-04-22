import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ProfilePhotoForm } from "@/components/features/teacher/ProfilePhotoForm";
import { TeacherBioForm } from "@/components/features/teacher/TeacherBioForm";
import { TeacherSubjectsForm } from "@/components/features/teacher/TeacherSubjectsForm";
import { TeacherRatesGrid } from "@/components/features/teacher/TeacherRatesGrid";
import { WeeklyScheduleCalendar } from "@/components/features/teacher/WeeklyScheduleCalendar";
import { ProfileCompletenessBar } from "@/components/features/teacher/ProfileCompletenessBar";
import { getMyTeacherProfile, listSubjects } from "@/server/teachers";
import { getPolicy, listRegions } from "@/server/policies";
import { smallestToMajor } from "@/lib/money";
import { formatPrice } from "@/lib/time";

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "?";
}

export async function TeacherProfilePage({ userId }: { userId: string }) {
  const [data, subjects, regions, policy] = await Promise.all([
    getMyTeacherProfile(userId),
    listSubjects(),
    listRegions(),
    getPolicy(),
  ]);
  if (!data) notFound();

  const { profile, studentsPerSubject, activeStudentCount } = data;
  const firstName = profile.user.firstName || profile.user.name.split(" ")[0] || "";
  const lastName = profile.user.lastName || profile.user.name.split(" ").slice(1).join(" ") || "";
  const fullName = `${firstName} ${lastName}`.trim() || profile.user.name;

  const teacherSubjectIds = new Set(profile.subjects.map((s) => s.subjectId));
  const taughtSubjects = profile.subjects.map((ts) => ({
    id: ts.subject.id,
    name: ts.subject.name,
    defaultCap: ts.defaultCap,
  }));

  const rateRegions = regions.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    currency: r.currency,
    minMajor: smallestToMajor(r.minRates[0]?.hourlyRate ?? 0, r.currency),
  }));

  const rateCells = profile.rates.map((r) => ({
    subjectId: r.subjectId,
    regionCode: r.region.code,
    hourlyMajor: smallestToMajor(r.hourlyRate, r.region.currency),
  }));

  const scheduleOfferings = profile.offerings.map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    subjectId: o.subjectId,
    subjectName: o.subject.name,
    dayOfWeek: o.dayOfWeek,
    startMinutes: o.startMinutes,
    endMinutes: o.endMinutes,
    teacherCap: o.teacherCap,
    enrolled: o.enrollments.length,
  }));

  const dialogSubjects = taughtSubjects.map((s) => ({
    id: s.id,
    name: s.name,
    defaultCap: s.defaultCap ?? Math.min(10, policy.globalClassCap),
  }));

  const rating = profile.avgRating;
  const ratingsCount = profile.ratingsCount;

  const checklist = [
    { label: "Profile photo", done: Boolean(profile.user.image) },
    { label: "Headline & bio", done: profile.headline.trim().length > 0 },
    { label: "Subjects I teach", done: profile.subjects.length > 0 },
    { label: "Hourly rates", done: profile.rates.length > 0 },
    { label: "Weekly schedule", done: profile.offerings.length > 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-header/10 sm:h-28 sm:w-28">
            {profile.user.image ? (
              <Image
                src={profile.user.image}
                alt={`${fullName} profile photo`}
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                {initials(firstName, lastName)}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-header sm:text-3xl">{fullName}</h1>
              <span className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-xs text-header">
                {profile.displayId}
              </span>
              {profile.profileCompleted ? (
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  Profile complete
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                  Profile in setup
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {profile.headline || "Add a headline in the Profile details section."}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-background px-2 py-1 text-header">
                <span aria-hidden>★</span>
                <span className="font-medium">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({ratingsCount})</span>
              </div>
              <Kpi label="Hours taught" value={profile.hoursTaught.toString()} />
              <Kpi label="Active periods" value={profile.offerings.length.toString()} />
              <Kpi label="Active students" value={activeStudentCount.toString()} />
            </div>
          </div>
        </div>
        <div className="mt-5">
          <ProfileCompletenessBar items={checklist} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>
              A clear, recent photo helps students pick the right teacher.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePhotoForm
              currentImage={profile.user.image ?? null}
              fallbackInitials={initials(firstName, lastName)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>Headline and about section.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeacherBioForm initial={{ headline: profile.headline, bio: profile.bio }} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subjects I teach</CardTitle>
          <CardDescription>
            Pick your subjects and set a default class size limit for each. The admin cap is{" "}
            <strong>{policy.globalClassCap}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherSubjectsForm
            allSubjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
            initial={profile.subjects.map((s) => ({
              subjectId: s.subjectId,
              defaultCap: s.defaultCap,
            }))}
            globalCap={policy.globalClassCap}
          />
          {profile.subjects.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {profile.subjects.map((s) => (
                <span
                  key={s.subjectId}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-header"
                >
                  {s.subject.name}
                  <span className="text-muted-foreground">
                    · {studentsPerSubject[s.subjectId] ?? 0} student
                    {(studentsPerSubject[s.subjectId] ?? 0) === 1 ? "" : "s"}
                  </span>
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hourly rates</CardTitle>
          <CardDescription>
            Set a rate per subject for each region. Students are billed by the
            hour based on the class periods they enroll in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherRatesGrid
            subjects={taughtSubjects.map((s) => ({ id: s.id, name: s.name }))}
            regions={rateRegions}
            rates={rateCells.filter((r) => teacherSubjectIds.has(r.subjectId))}
          />
          {profile.rates.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1 text-sm">
              {profile.rates.map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <span className="text-text/80">
                    {r.subject.name} &middot; {r.region.name}
                  </span>
                  <span className="font-medium text-header">
                    {formatPrice(r.hourlyRate, r.region.currency)}/hr
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
          <CardDescription>
            Click an empty slot to add a class period, or click an existing
            block to edit. Each period has its own capacity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dialogSubjects.length === 0 ? (
            <p className="rounded-md bg-background p-4 text-sm text-muted-foreground">
              Pick your subjects above first, then come back here to schedule
              class periods.
            </p>
          ) : (
            <WeeklyScheduleCalendar
              offerings={scheduleOfferings}
              subjects={dialogSubjects}
              globalCap={policy.globalClassCap}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col leading-tight">
      <span className="text-lg font-semibold text-header">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
