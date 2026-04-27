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
import { TextLink } from "@/components/ui/Link";
import { Muted, PageHeader, PageTitle, PageWrap } from "@/components/ui/primitives";
import {
  getAssignmentForStudent,
  getAssignmentForTeacher,
} from "@/server/assignments";
import { StudentSubmitForm } from "./StudentSubmitForm";
import { AssignmentSubmissions } from "./AssignmentSubmissions";
import {
  AttachmentLink,
  ContentStack,
  ContentStackLg,
  Description,
  Feedback,
  GradeStack,
  GradeStrong,
  GradeText,
  InlineLink,
  MutedText,
  Submitted,
  SubmissionBox,
  Top,
} from "./AssignmentBody";

export const metadata: Metadata = { title: "Assignment" };

interface PageProps {
  params: Promise<{ offeringId: string; assignmentId: string }>;
}

const formatDate = (d: Date) =>
  d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const attachmentUrl = (path: string) =>
  `/api/files/${path
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/")}`;

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

  if (role === "TEACHER") {
    if (offering.teacherProfile.userId !== session.user.id) redirect("/dashboard");
    const assignment = await getAssignmentForTeacher({
      teacherUserId: session.user.id,
      assignmentId,
    });
    if (!assignment) notFound();

    return (
      <PageWrap>
        <PageHeader>
          <PageTitle>{assignment.title}</PageTitle>
          <Muted>
            {offering.subject.name} · Due {formatDate(assignment.dueAt)}
          </Muted>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentStack>
              {assignment.description ? (
                <Description>{assignment.description}</Description>
              ) : (
                <MutedText>No description.</MutedText>
              )}
              {assignment.attachmentPath ? (
                <AttachmentLink href={attachmentUrl(assignment.attachmentPath)}>
                  Download your attachment
                </AttachmentLink>
              ) : null}
            </ContentStack>
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
              <MutedText>No submissions yet.</MutedText>
            ) : (
              <AssignmentSubmissions
                offeringId={offeringId}
                assignmentId={assignment.id}
                attachmentUrl={attachmentUrl}
                submissions={assignment.submissions.map((s) => ({
                  id: s.id,
                  studentName: s.studentProfile.user.name,
                  filePath: s.filePath,
                  submittedAtLabel: formatDate(s.submittedAt),
                  grade: s.grade,
                  feedback: s.feedback ?? "",
                }))}
              />
            )}
          </CardContent>
        </Card>
      </PageWrap>
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
      <PageWrap>
        <PageHeader>
          <PageTitle>{assignment.title}</PageTitle>
          <Muted>
            {assignment.offering.subject.name} · Due {formatDate(assignment.dueAt)}
          </Muted>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle>Brief</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentStack>
              {assignment.description ? (
                <Description>{assignment.description}</Description>
              ) : (
                <MutedText>No description.</MutedText>
              )}
              {assignment.attachmentPath ? (
                <AttachmentLink href={attachmentUrl(assignment.attachmentPath)}>
                  Download the attachment
                </AttachmentLink>
              ) : null}
            </ContentStack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your submission</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentStackLg>
              {mySubmission ? (
                <SubmissionBox>
                  <Top>
                    <InlineLink href={attachmentUrl(mySubmission.filePath)}>
                      Download your file
                    </InlineLink>
                    <Submitted>Submitted {formatDate(mySubmission.submittedAt)}</Submitted>
                  </Top>
                  {mySubmission.grade !== null ? (
                    <GradeStack>
                      <GradeText>
                        Grade: <GradeStrong>{mySubmission.grade}/100</GradeStrong>
                      </GradeText>
                      {mySubmission.feedback ? (
                        <Feedback>{mySubmission.feedback}</Feedback>
                      ) : null}
                    </GradeStack>
                  ) : (
                    <Submitted>Not graded yet.</Submitted>
                  )}
                </SubmissionBox>
              ) : null}
              <StudentSubmitForm
                offeringId={offeringId}
                assignmentId={assignment.id}
                hasExisting={Boolean(mySubmission)}
              />
            </ContentStackLg>
          </CardContent>
        </Card>
      </PageWrap>
    );
  }

  if (role === "ADMIN") {
    return (
      <PageWrap>
        <Muted>
          Admin preview.{" "}
          <TextLink href={`/classes/${offeringId}/assignments`}>
            Back to assignments
          </TextLink>
        </Muted>
      </PageWrap>
    );
  }

  redirect("/dashboard");
}
