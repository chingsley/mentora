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
import { Muted, PageHeader, PageTitle, PageWrap } from "@/components/ui/primitives";
import { listAssignmentsForOffering } from "@/server/assignments";
import { NewAssignmentForm } from "./NewAssignmentForm";
import { AssignmentList } from "./AssignmentList";
import { AssignmentsHeading } from "./AssignmentsHeading";

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
    <PageWrap>
      <PageHeader>
        <AssignmentsHeading subjectName={offering.subject.name}>
          <PageTitle>Assignments</PageTitle>
        </AssignmentsHeading>
        <Muted>
          {offering.title} · taught by {offering.teacherProfile.user.name}
        </Muted>
      </PageHeader>

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
            <Muted>No assignments yet.</Muted>
          ) : (
            <AssignmentList
              offeringId={offering.id}
              showCounts={isTeacher}
              items={assignments.map((a) => ({
                id: a.id,
                title: a.title,
                dueAt: a.dueAt.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
                submissionsCount: a.submissions.length,
              }))}
            />
          )}
        </CardContent>
      </Card>
    </PageWrap>
  );
}
