import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { listGuardianWards } from "@/server/guardians";

export const metadata: Metadata = { title: "My wards" };

export default async function GuardianIndexPage() {
  const session = await requireRole("GUARDIAN");
  const wards = await listGuardianWards(session.user.id);

  if (wards.length === 1 && wards[0]) {
    redirect(`/guardian/w/${wards[0].studentProfileId}`);
  }

  if (wards.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-header sm:text-3xl">My wards</h1>
          <p className="text-sm text-muted-foreground">
            Ask a student to invite you with a 9-character invite code.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>No linked students yet</CardTitle>
            <CardDescription>
              Once a student sends you an invite code, sign in and enter it to accept. After
              that, each ward will appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">My wards</h1>
        <p className="text-sm text-muted-foreground">
          Pick a student to view their timetable, attendance, teachers, and grades.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {wards.map((w) => (
          <li key={w.studentProfileId}>
            <Link
              href={`/guardian/w/${w.studentProfileId}`}
              className="flex items-center gap-3 rounded-xl bg-foreground p-4 ring-1 ring-black/5 transition-colors hover:bg-header/[0.03]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-header/10 text-sm font-semibold uppercase text-header">
                {initials(w.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-header">{w.name}</p>
                <p className="text-xs text-muted-foreground">View profile & schedule</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("").toUpperCase() || "?";
}
