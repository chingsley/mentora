"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { GradeSubmissionForm } from "./GradeSubmissionForm";

const List = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;

  & > li + li {
    border-top: 1px solid ${COLORS.BORDER};
  }
`;

const Row = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  padding: ${SPACING.FOUR} 0;
`;

const Top = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const Name = styled.span`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const DownloadLink = styled.a`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  text-decoration: underline;
`;

const Submitted = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const GradedPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid #6ee7b7;
  background-color: #ecfdf5;
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  color: #064e3b;
`;

const UngradedPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface SubmissionItem {
  id: string;
  studentName: string;
  filePath: string;
  submittedAtLabel: string;
  grade: number | null;
  feedback: string;
}

export interface AssignmentSubmissionsProps {
  offeringId: string;
  assignmentId: string;
  submissions: SubmissionItem[];
  attachmentUrl: (path: string) => string;
}

export function AssignmentSubmissions({
  offeringId,
  assignmentId,
  submissions,
  attachmentUrl,
}: AssignmentSubmissionsProps) {
  return (
    <List>
      {submissions.map((s) => (
        <Row key={s.id}>
          <Top>
            <Name>{s.studentName}</Name>
            <DownloadLink href={attachmentUrl(s.filePath)}>Download</DownloadLink>
            <Submitted>Submitted {s.submittedAtLabel}</Submitted>
            {s.grade !== null ? (
              <GradedPill>{s.grade}/100</GradedPill>
            ) : (
              <UngradedPill>Not graded</UngradedPill>
            )}
          </Top>
          <GradeSubmissionForm
            submissionId={s.id}
            offeringId={offeringId}
            assignmentId={assignmentId}
            initialGrade={s.grade}
            initialFeedback={s.feedback}
          />
        </Row>
      ))}
    </List>
  );
}
