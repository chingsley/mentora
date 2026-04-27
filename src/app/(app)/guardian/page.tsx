import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Muted, PageHeader, PageTitle, PageWrap } from "@/components/ui/primitives";
import { listGuardianWards } from "@/server/guardians";
import { WardGrid, WardLink } from "./WardLink";

export const metadata: Metadata = { title: "My wards" };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase() || "?";
}

export default async function GuardianIndexPage() {
  const session = await requireRole("GUARDIAN");
  const wards = await listGuardianWards(session.user.id);

  if (wards.length === 1 && wards[0]) {
    redirect(`/guardian/w/${wards[0].studentProfileId}`);
  }

  if (wards.length === 0) {
    return (
      <PageWrap>
        <PageHeader>
          <PageTitle>My wards</PageTitle>
          <Muted>Ask a student to invite you with a 9-character invite code.</Muted>
        </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle>No linked students yet</CardTitle>
            <CardDescription>
              Once a student sends you an invite code, sign in and enter it to
              accept. After that, each ward will appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <PageHeader>
        <PageTitle>My wards</PageTitle>
        <Muted>
          Pick a student to view their timetable, attendance, teachers, and grades.
        </Muted>
      </PageHeader>
      <WardGrid>
        {wards.map((w) => (
          <WardLink
            key={w.studentProfileId}
            studentProfileId={w.studentProfileId}
            name={w.name}
            initials={initials(w.name)}
          />
        ))}
      </WardGrid>
    </PageWrap>
  );
}
