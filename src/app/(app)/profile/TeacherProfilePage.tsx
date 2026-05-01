import type { DayOfWeek } from "@prisma/client";
import { notFound } from "next/navigation";
import { TeacherProfileTabsClient } from "@/components/features/teacher/profile/TeacherProfileTabsClient";
import type { TeacherProfileChecklistItem } from "@/components/features/teacher/profile/TeacherProfileTabs.types";
import { smallestToMajor } from "@/lib/money";
import { formatPrice } from "@/lib/time";
import { getPolicy, listRegions } from "@/server/policies";
import { getMyTeacherProfile, listSubjects } from "@/server/teachers";

/**
 * Explicit shape for `getMyTeacherProfile().profile` on this page.
 * Prisma client payload inference sometimes narrows composite relation scalars
 * (e.g. TeacherSubject metadata) in the IDE; we assert to this DB-aligned shape once.
 */
interface TeacherSubjectForPage {
  teacherProfileId: string;
  subjectId: string;
  defaultCap: number | null;
  courseDescription: string;
  gradeLevel: string;
  syllabus: string;
  subject: { id: string; name: string; slug: string };
}

interface TeacherProfileForPage {
  displayId: string;
  headline: string;
  bio: string;
  timeZone: string;
  spokenLanguages: string;
  locationLabel: string;
  payoutLegalName: string | null;
  payoutCountryCode: string | null;
  payoutPreferredMethod: string | null;
  payoutNotes: string | null;
  profileCompleted: boolean;
  avgRating: number;
  ratingsCount: number;
  hoursTaught: number;
  user: {
    image: string | null;
    name: string;
    firstName: string;
    lastName: string;
    region: { id: string; code: string; name: string; currency: string } | null;
  };
  subjects: TeacherSubjectForPage[];
  rates: Array<{
    id: string;
    subjectId: string;
    hourlyRate: number;
    subject: { name: string };
    region: { name: string; code: string; currency: string };
  }>;
  offerings: Array<{
    id: string;
    title: string;
    description: string | null;
    subjectId: string;
    dayOfWeek: DayOfWeek;
    startMinutes: number;
    endMinutes: number;
    teacherCap: number | null;
    enrollments: { id: string }[];
    subject: { name: string };
  }>;
}

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "?";
}

export async function TeacherProfilePage({
  userId,
  initialTab,
}: {
  userId: string;
  initialTab?: string | null;
}) {
  const [data, subjects, regions, policy] = await Promise.all([
    getMyTeacherProfile(userId),
    listSubjects(),
    listRegions(),
    getPolicy(),
  ]);
  if (!data) notFound();

  const { profile: profileRow, studentsPerSubject, activeStudentCount } = data;
  const profile = profileRow as unknown as TeacherProfileForPage;
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
    teacherCap: o.teacherCap ?? policy.globalClassCap,
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

  const subjectMetaOk = profile.subjects.every((s) => {
    const desc = String(s.courseDescription ?? "").trim();
    const grade = String(s.gradeLevel ?? "").trim();
    return desc.length >= 10 && grade.length > 0;
  });

  const checklist: TeacherProfileChecklistItem[] = [
    { label: "Profile photo", done: Boolean(profile.user.image), editTab: "bio" },
    {
      label: "Languages spoken",
      done: Boolean(String(profile.spokenLanguages ?? "").trim()),
      editTab: "bio",
    },
    { label: "Bio", done: profile.bio.trim().length > 0, editTab: "bio" },
    { label: "Subjects & class caps", done: profile.subjects.length > 0, editTab: "courses" },
    { label: "Course description & grade", done: subjectMetaOk, editTab: "courses" },
    { label: "Hourly rates", done: profile.rates.length > 0, editTab: "courses" },
    { label: "Weekly schedule", done: profile.offerings.length > 0, editTab: "schedule" },
  ];

  return (
    <TeacherProfileTabsClient
      initialTab={initialTab}
      fullName={fullName}
      initials={initials(firstName, lastName)}
      imageUrl={profile.user.image ?? null}
      displayId={profile.displayId}
      profileCompleted={profile.profileCompleted}
      headline={profile.headline}
      bio={profile.bio}
      rating={profile.avgRating}
      ratingsCount={profile.ratingsCount}
      hoursTaught={profile.hoursTaught}
      offeringCount={profile.offerings.length}
      activeStudentCount={activeStudentCount}
      globalCap={policy.globalClassCap}
      checklist={checklist}
      teacherRegionName={profile.user.region?.name ?? ""}
      timeZone={profile.timeZone ?? ""}
      spokenLanguages={profile.spokenLanguages ?? ""}
      locationLabel={profile.locationLabel ?? ""}
      payoutLegalName={profile.payoutLegalName}
      payoutCountryCode={profile.payoutCountryCode}
      payoutPreferredMethod={profile.payoutPreferredMethod}
      payoutNotes={profile.payoutNotes}
      allSubjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      initialSubjects={profile.subjects.map((s) => ({
        subjectId: s.subjectId,
        defaultCap: s.defaultCap,
        courseDescription: s.courseDescription ?? "",
        gradeLevel: s.gradeLevel ?? "",
        syllabus: s.syllabus ?? "",
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
