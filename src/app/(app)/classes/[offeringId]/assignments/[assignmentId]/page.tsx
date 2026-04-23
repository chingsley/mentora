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
import {
  getAssignmentForStudent,
  getAssignmentForTeacher,
} from "@/server/assignments";
import { StudentSubmitForm } from "./StudentSubmitForm";
import { GradeSubmissionForm } from "./GradeSubmissionForm";

export const metadata: Metadata = { title: "Assignment" };

interface PageProps {
  params: Promise<{ offeringId: string; assignmentId: string }>;
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { offeringId, assignmentId } = await params;
  const session = await requireSession();
  const role = session.user.role;

  const offering = await db.classOffering.findUnique({
    where: { id: offeringId },
    include: {
      subject: true,
      teacherProfile: { select: { userId: true, user: { select: { name: true } } } },
    },
  });
  if (!offering) notFound();

  const attachmentUrl = (path: string) =>
    `/api/files/${path
      .split("/")
      .map((p) => encodeURIComponent(p))
      .join("/")}`;

  if (role === "TEACHER") {
    if (offering.teacherProfile.userId !== session.user.id) redirect("/dashboard");
    const assignment = await getAssignmentForTeacher({
      teacherUserId: session.user.id,
      assignmentId,
    });
    if (!assignment) notFound();

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-header sm:text-3xl">{assignment.title}</h1>
          <p className="text-sm text-muted-foreground">
            {offering.subject.name} · Due{" "}
            {assignment.dueAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {assignment.description ? (
              <p className="whitespace-pre-wrap text-sm text-text/80">{assignment.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No description.</p>
            )}
            {assignment.attachmentPath ? (
              <a
                href={attachmentUrl(assignment.attachmentPath)}
                className="text-sm font-medium text-header hover:underline"
              >
                Download your attachment
              </a>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>
              {assignment.submissions.length} submission
              {assignment.submissions.length === 1 ? "" : "s"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignment.submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {assignment.submissions.map((s) => (
                  <li key={s.id} className="flex flex-col gap-2 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-header">
                        {s.studentProfile.user.name}
                      </span>
                      <a
                        href={attachmentUrl(s.filePath)}
                        className="text-xs font-medium text-header underline"
                      >
                        Download
                      </a>
                      <span className="text-xs text-muted-foreground">
                        Submitted {s.submittedAt.toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      {s.grade !== null ? (
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-900">
                          {s.grade}/100
                        </span>
                      ) : (
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                          Not graded
                        </span>
                      )}
                    </div>
                    <GradeSubmissionForm
                      submissionId={s.id}
                      offeringId={offeringId}
                      assignmentId={assignment.id}
                      initialGrade={s.grade}
                      initialFeedback={s.feedback ?? ""}
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role === "STUDENT") {
    const data = await getAssignmentForStudent({
      studentUserId: session.user.id,
      assignmentId,
    });
    if (!data) notFound();
    const { assignment, mySubmission } = data;

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-header sm:text-3xl">{assignment.title}</h1>
          <p className="text-sm text-muted-foreground">
            {assignment.offering.subject.name} · Due{" "}
            {assignment.dueAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brief</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {assignment.description ? (
              <p className="whitespace-pre-wrap text-sm text-text/80">{assignment.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No description.</p>
            )}
            {assignment.attachmentPath ? (
              <a
                href={attachmentUrl(assignment.attachmentPath)}
                className="text-sm font-medium text-header hover:underline"
              >
                Download the attachment
              </a>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your submission</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {mySubmission ? (
              <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={attachmentUrl(mySubmission.filePath)}
                    className="text-sm font-medium text-header underline"
                  >
                    Download your file
                  </a>
                  <span className="text-xs text-muted-foreground">
                    Submitted{" "}
                    {mySubmission.submittedAt.toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                {mySubmission.grade !== null ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">
                      Grade:{" "}
                      <strong className="text-header">{mySubmission.grade}/100</strong>
                    </p>
                    {mySubmission.feedback ? (
                      <p className="whitespace-pre-wrap text-sm text-text/80">
                        {mySubmission.feedback}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Not graded yet.</p>
                )}
              </div>
            ) : null}
            <StudentSubmitForm
              offeringId={offeringId}
              assignmentId={assignment.id}
              hasExisting={Boolean(mySubmission)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role === "ADMIN") {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Admin preview.{" "}
          <Link href={`/classes/${offeringId}/assignments`} className="underline">
            Back to assignments
          </Link>
        </p>
      </div>
    );
  }

  redirect("/dashboard");
}
