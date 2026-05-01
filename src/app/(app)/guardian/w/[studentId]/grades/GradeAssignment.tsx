"use client";

import * as React from "react";
import styled from "styled-components";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const SubjectPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const GradePill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid #6ee7b7;
  background-color: #ecfdf5;
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  color: #064e3b;
`;

const AwaitingPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const MissingPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid #fcd34d;
  background-color: #fffbeb;
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  color: #78350f;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const Description = styled.p`
  white-space: pre-wrap;
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

const InlineLink = styled.a`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const SubmissionBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.THREE};
`;

const SubmissionHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const SubmissionLink = styled.a`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  text-decoration: underline;
`;

const Submitted = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Feedback = styled.p`
  white-space: pre-wrap;
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

const FeedbackLabel = styled.span`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

export interface GradeAssignmentSubmission {
  filePath: string;
  submittedLabel: string;
  grade: number | null;
  feedback: string;
}

export interface GradeAssignmentItem {
  id: string;
  title: string;
  subjectName: string;
  description: string | null;
  dueLabel: string;
  attachmentPath: string | null;
  submission: GradeAssignmentSubmission | null;
}

export interface GradeAssignmentProps {
  item: GradeAssignmentItem;
  attachmentUrl: (path: string) => string;
}

export function GradeAssignment({ item, attachmentUrl }: GradeAssignmentProps) {
  const { submission } = item;

  return (
    <Card>
      <CardHeader>
        <HeaderRow>
          <CardTitle>{item.title}</CardTitle>
          <SubjectPill>{item.subjectName}</SubjectPill>
          {submission?.grade !== null && submission?.grade !== undefined ? (
            <GradePill>{submission.grade}/100</GradePill>
          ) : submission ? (
            <AwaitingPill>Awaiting grade</AwaitingPill>
          ) : (
            <MissingPill>Not submitted</MissingPill>
          )}
        </HeaderRow>
        <CardDescription>Due {item.dueLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <Body>
          {item.description ? <Description>{item.description}</Description> : null}
          {item.attachmentPath ? (
            <InlineLink href={attachmentUrl(item.attachmentPath)}>
              Download assignment brief
            </InlineLink>
          ) : null}
          {submission ? (
            <SubmissionBox>
              <SubmissionHead>
                <SubmissionLink href={attachmentUrl(submission.filePath)}>
                  Download submission
                </SubmissionLink>
                <Submitted>Submitted {submission.submittedLabel}</Submitted>
              </SubmissionHead>
              {submission.feedback ? (
                <Feedback>
                  <FeedbackLabel>Teacher feedback: </FeedbackLabel>
                  {submission.feedback}
                </Feedback>
              ) : null}
            </SubmissionBox>
          ) : null}
        </Body>
      </CardContent>
    </Card>
  );
}
