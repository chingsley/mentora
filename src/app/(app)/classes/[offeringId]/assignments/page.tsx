import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { listAssignmentsForOffering } from "@/server/assignments";
import { NewAssignmentForm } from "./NewAssignmentForm";

export const metadata: Metadata = { title: "Assignments" };

interface PageProps {
  params: Promise<{ offeringId: string }>;
}

export default async function OfferingAssignmentsPage({ params }: PageProps) {
  const { offeringId } = await params;
  const session = await requireSession();

  const offering = await db.classOffering.findUnique({
    where: { id: offeringId },
    include: {
      subject: true,
      teacherProfile: {
        include: { user: { select: { id: true, name: true } } },
      },
      enrollments: {
        where: { status: "ACTIVE" },
        include: { studentProfile: { select: { userId: true } } },
      },
    },
  });
  if (!offering) notFound();

  const role = session.user.role;
  const isTeacher =
    role === "TEACHER" && offering.teacherProfile.userId === session.user.id;
  const isStudent =
    role === "STUDENT" &&
    offering.enrollments.some((e) => e.studentProfile.userId === session.user.id);

  if (!isTeacher && !isStudent && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const assignments = await listAssignmentsForOffering(offering.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-header sm:text-3xl">
            Assignments
          </h1>
          <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
            {offering.subject.name}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {offering.title} · taught by {offering.teacherProfile.user.name}
        </p>
      </div>

      {isTeacher ? (
        <Card>
          <CardHeader>
            <CardTitle>Post a new assignment</CardTitle>
            <CardDescription>
              Add a title, an optional description, a due date, and an optional
              attachment (PDF, DOCX, images, etc.).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewAssignmentForm offeringId={offering.id} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>All assignments</CardTitle>
          <CardDescription>
            {assignments.length} assignment{assignments.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {assignments.map((a) => {
                const submissionsCount = a.submissions.length;
                return (
                  <li key={a.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/classes/${offering.id}/assignments/${a.id}`}
                        className="font-medium text-header hover:underline"
                      >
                        {a.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Due {a.dueAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                    {isTeacher ? (
                      <span className="text-xs text-muted-foreground">
                        {submissionsCount} submission{submissionsCount === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
