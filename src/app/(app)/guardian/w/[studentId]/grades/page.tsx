import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { db } from "@/lib/db";
import { listAssignmentsForGuardianWard } from "@/server/assignments";

export const metadata: Metadata = { title: "Ward grades" };

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function WardGradesPage({ params }: PageProps) {
  const { studentId } = await params;
  const session = await requireRole("GUARDIAN");

  const student = await db.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: { select: { name: true } } },
  });
  if (!student) notFound();

  const assignments = await listAssignmentsForGuardianWard({
    guardianUserId: session.user.id,
    studentProfileId: studentId,
  });

  const attachmentUrl = (path: string) =>
    `/api/files/${path
      .split("/")
      .map((p) => encodeURIComponent(p))
      .join("/")}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">
          {student.user.name}&apos;s grades
        </h1>
        <p className="text-sm text-muted-foreground">
          Read-only view of assignments, submissions, grades, and teacher feedback.
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No assignments yet</CardTitle>
            <CardDescription>
              When teachers post assignments for your ward&apos;s classes, they&apos;ll show up here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="flex flex-col gap-4">
          {assignments.map((a) => {
            const submission = a.submissions[0] ?? null;
            return (
              <li key={a.id}>
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle>{a.title}</CardTitle>
                      <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                        {a.offering.subject.name}
                      </span>
                      {submission?.grade !== null && submission?.grade !== undefined ? (
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-900">
                          {submission.grade}/100
                        </span>
                      ) : submission ? (
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                          Awaiting grade
                        </span>
                      ) : (
                        <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-900">
                          Not submitted
                        </span>
                      )}
                    </div>
                    <CardDescription>
                      Due{" "}
                      {a.dueAt.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {a.description ? (
                      <p className="whitespace-pre-wrap text-sm text-text/80">{a.description}</p>
                    ) : null}
                    {a.attachmentPath ? (
                      <a
                        href={attachmentUrl(a.attachmentPath)}
                        className="text-sm font-medium text-header hover:underline"
                      >
                        Download assignment brief
                      </a>
                    ) : null}
                    {submission ? (
                      <div className="flex flex-col gap-1 rounded-md border border-border bg-background p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={attachmentUrl(submission.filePath)}
                            className="text-sm font-medium text-header underline"
                          >
                            Download submission
                          </a>
                          <span className="text-xs text-muted-foreground">
                            Submitted{" "}
                            {submission.submittedAt.toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                        {submission.feedback ? (
                          <p className="whitespace-pre-wrap text-sm text-text/80">
                            <span className="font-medium text-header">Teacher feedback: </span>
                            {submission.feedback}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
