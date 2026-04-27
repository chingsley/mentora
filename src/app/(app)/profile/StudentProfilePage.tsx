import { notFound } from "next/navigation";
import { getMyStudentProfile } from "@/server/students";
import { listSubjects } from "@/server/teachers";
import { StudentProfileView } from "./StudentProfileView";

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
    <StudentProfileView
      fullName={fullName}
      firstName={firstName}
      lastName={lastName}
      initials={initials(firstName, lastName)}
      imageUrl={profile.user.image ?? null}
      hasInterests={hasInterests}
      bio={profile.bio ?? null}
      activeClassCount={activeClassCount}
      interestSubjectIds={interestSubjectIds}
      interestNames={interestNames}
      regionName={profile.user.region?.name ?? null}
      allSubjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
