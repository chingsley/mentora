import { notFound } from "next/navigation";
import { getMyTeacherProfile, listSubjects } from "@/server/teachers";
import { getPolicy, listRegions } from "@/server/policies";
import { smallestToMajor } from "@/lib/money";
import { formatPrice } from "@/lib/time";
import { TeacherProfileView } from "./TeacherProfileView";

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

  const rateCells = profile.rates
    .filter((r) => teacherSubjectIds.has(r.subjectId))
    .map((r) => ({
      subjectId: r.subjectId,
      regionCode: r.region.code,
      hourlyMajor: smallestToMajor(r.hourlyRate, r.region.currency),
    }));

  const rateRows = profile.rates.map((r) => ({
    id: r.id,
    subjectName: r.subject.name,
    regionName: r.region.name,
    hourlyDisplay: formatPrice(r.hourlyRate, r.region.currency),
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

  const taughtSubjectsWithStudents = profile.subjects.map((s) => ({
    subjectId: s.subjectId,
    subjectName: s.subject.name,
    defaultCap: s.defaultCap,
    studentCount: studentsPerSubject[s.subjectId] ?? 0,
  }));

  const checklist = [
    { label: "Profile photo", done: Boolean(profile.user.image) },
    { label: "Headline & bio", done: profile.headline.trim().length > 0 },
    { label: "Subjects I teach", done: profile.subjects.length > 0 },
    { label: "Hourly rates", done: profile.rates.length > 0 },
    { label: "Weekly schedule", done: profile.offerings.length > 0 },
  ];

  return (
    <TeacherProfileView
      fullName={fullName}
      initials={initials(firstName, lastName)}
      imageUrl={profile.user.image ?? null}
      displayId={profile.displayId}
      profileCompleted={profile.profileCompleted}
      headline={profile.headline}
      rating={profile.avgRating}
      ratingsCount={profile.ratingsCount}
      hoursTaught={profile.hoursTaught}
      offeringCount={profile.offerings.length}
      activeStudentCount={activeStudentCount}
      globalCap={policy.globalClassCap}
      checklist={checklist}
      allSubjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      bio={profile.bio}
      initialSubjects={profile.subjects.map((s) => ({
        subjectId: s.subjectId,
        defaultCap: s.defaultCap,
      }))}
      taughtSubjects={taughtSubjects}
      taughtSubjectsWithStudents={taughtSubjectsWithStudents}
      rateRegions={rateRegions}
      rateCells={rateCells}
      rateRows={rateRows}
      dialogSubjects={dialogSubjects}
      scheduleOfferings={scheduleOfferings}
    />
  );
}
