import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ProfilePhotoForm } from "@/components/features/teacher/ProfilePhotoForm";
import { StudentBioForm } from "@/components/features/student/StudentBioForm";
import { StudentInterestsForm } from "@/components/features/student/StudentInterestsForm";
import { getMyStudentProfile } from "@/server/students";
import { listSubjects } from "@/server/teachers";

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "?";
}

export async function StudentProfilePage({ userId }: { userId: string }) {
  const [profile, subjects] = await Promise.all([
    getMyStudentProfile(userId),
    listSubjects(),
  ]);
  if (!profile) notFound();

  const firstName =
    profile.user.firstName || profile.user.name.split(" ")[0] || "";
  const lastName =
    profile.user.lastName ||
    profile.user.name.split(" ").slice(1).join(" ") ||
    "";
  const fullName = `${firstName} ${lastName}`.trim() || profile.user.name;

  const interestSubjectIds = profile.interests.map((i) => i.subjectId);
  const interestNames = profile.interests.map((i) => i.subject.name);
  const activeClassCount = profile.enrollments.length;

  const hasInterests = interestSubjectIds.length > 0;

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
              <h1 className="text-2xl font-semibold text-header sm:text-3xl">
                {fullName}
              </h1>
              {hasInterests ? (
                <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  Profile ready
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                  Pick your interests
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {profile.bio?.trim()
                ? profile.bio
                : "Add a short bio so teachers know more about you."}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
              <Kpi label="Active classes" value={activeClassCount.toString()} />
              <Kpi label="Interests" value={interestSubjectIds.length.toString()} />
              {profile.user.region ? (
                <Kpi label="Region" value={profile.user.region.name} />
              ) : null}
            </div>
            {interestNames.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {interestNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-text/80"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-background p-3">
          <p className="text-sm text-muted-foreground">
            Ready to find a teacher? Filter by the subjects you just picked.
          </p>
          <Link
            href="/teachers"
            className="inline-flex h-9 items-center rounded-md bg-header px-3 text-sm font-medium text-white hover:bg-header/90"
          >
            Browse teachers
          </Link>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile photo</CardTitle>
            <CardDescription>
              A clear photo helps your teachers recognise you in class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfilePhotoForm
              currentImage={profile.user.image ?? null}
              fallbackInitials={initials(firstName, lastName)}
              hint="PNG, JPEG, or WebP · up to 2 MB. Optional but recommended."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About you</CardTitle>
            <CardDescription>Share a bit so teachers know your goals.</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentBioForm initial={{ bio: profile.bio ?? "" }} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subjects I want to learn</CardTitle>
          <CardDescription>
            We use these to recommend teachers and classes that match your
            interests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentInterestsForm
            allSubjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
            initialSubjectIds={interestSubjectIds}
          />
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
