import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Muted, PageHeader, PageTitle, PageWrap } from "@/components/ui/primitives";
import { db } from "@/lib/db";
import { listAssignmentsForGuardianWard } from "@/server/assignments";
import { GradeAssignment, List } from "./GradeAssignment";

export const metadata: Metadata = { title: "Ward grades" };

interface PageProps {
  params: Promise<{ studentId: string }>;
}

const formatDate = (d: Date) =>
  d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const attachmentUrl = (path: string) =>
  `/api/files/${path
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/")}`;

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

  return (
    <PageWrap>
      <PageHeader>
        <PageTitle>{student.user.name}&apos;s grades</PageTitle>
        <Muted>
          Read-only view of assignments, submissions, grades, and teacher
          feedback.
        </Muted>
      </PageHeader>

      {assignments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No assignments yet</CardTitle>
            <CardDescription>
              When teachers post assignments for your ward&apos;s classes,
              they&apos;ll show up here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <List>
          {assignments.map((a) => {
            const submission = a.submissions[0] ?? null;
            return (
              <li key={a.id}>
                <GradeAssignment
                  attachmentUrl={attachmentUrl}
                  item={{
                    id: a.id,
                    title: a.title,
                    subjectName: a.offering.subject.name,
                    description: a.description ?? null,
                    dueLabel: formatDate(a.dueAt),
                    attachmentPath: a.attachmentPath ?? null,
                    submission: submission
                      ? {
                          filePath: submission.filePath,
                          submittedLabel: formatDate(submission.submittedAt),
                          grade: submission.grade,
                          feedback: submission.feedback ?? "",
                        }
                      : null,
                  }}
                />
              </li>
            );
          })}
        </List>
      )}
    </PageWrap>
  );
}
