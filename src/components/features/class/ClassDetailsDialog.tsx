"use client";

import type { DayOfWeek, OfferingPeriodType, Role } from "@prisma/client";
import type { OfferingRecurrence } from "@/lib/offeringRecurrence";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { formatPrice, minutesToTime } from "@/lib/time";
import { DEFAULT_OFFERING_RECURRENCE, formatRecurrenceLabel } from "@/lib/offeringRecurrence";
import { fillStatus } from "@/components/features/calendar/types";
import type { SessionOccurrenceSnapshot } from "@/lib/sessionOccurrenceKey";
import {
  CommentSubheading,
  CommentSubsection,
  CommentSubsectionDivider,
  CommentsSubsections,
  SessionStudentCommentPanel,
  SessionTeacherCommentPanel,
} from "./SessionCommentsPanel";
import { SessionStatusPanel } from "./SessionStatusPanel";
import { JoinClassButton } from "@/components/features/student/JoinClassButton";

export interface ClassDetail {
  offeringId: string;
  title: string;
  subjectName: string;
  teacherName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  effectiveCap: number;
  enrolled: number;
  periodType?: OfferingPeriodType;
  hourlyRate: { amount: number; currency: string } | null;
  rules: string;
  description?: string | null;
  recurrence?: OfferingRecurrence;
}

export interface ClassDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  detail: ClassDetail | null;
  viewerRole: Role;
  enrollmentId: string | null;
  isBusy?: boolean;
  message?: { tone: "success" | "error"; text: string } | null;
  sessionSnapshot?: SessionOccurrenceSnapshot | null;
  studentDisplayName?: string;
  onEnrol?: (offeringId: string) => void | Promise<void>;
  onDrop?: (enrollmentId: string) => void | Promise<void>;
}

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const Title = styled.h2`
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const MetaLine = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Subtitle = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const StatGrid = styled.dl`
  margin-top: ${SPACING.FOUR};
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StatBox = styled.div`
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.TWO};
`;

const StatLabel = styled.dt`
  font-size: ${FONTS.SIZE.META};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const StatValue = styled.dd<{ $emphasised?: boolean }>`
  margin-top: 0.125rem;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${(p) => (p.$emphasised ? COLORS.DESTRUCTIVE : COLORS.HEADER)};
`;

const Section = styled.section`
  margin-top: ${SPACING.FOUR};
`;

const DividedSection = styled.section`
  margin-top: ${SPACING.TEN};
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const SectionHeading = styled.h3`
  margin-bottom: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const SectionHeadingTight = styled(SectionHeading)`
  margin-bottom: ${SPACING.TWO};
`;

const DividedSectionHeading = styled(SectionHeadingTight)`
  margin-bottom: 0;
  padding-bottom: ${SPACING.TWO};
  border-bottom: 1px solid ${COLORS.BORDER};
`;

const Description = styled.p`
  white-space: pre-wrap;
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

const Empty = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const RulesList = styled.ul`
  list-style: disc;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
  color: rgba(2, 8, 23, 0.8);
`;

const Message = styled.p<{ $tone: "success" | "error" }>`
  margin-top: ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  color: ${(p) => (p.$tone === "success" ? COLORS.SUCCESS : COLORS.DESTRUCTIVE)};
`;

const Footer = styled.footer`
  margin-top: ${SPACING.FIVE};
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  border-top: 1px solid ${COLORS.BORDER};
  padding-top: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
  }
`;

export function ClassDetailsDialog({
  open,
  onClose,
  detail,
  viewerRole,
  enrollmentId,
  isBusy,
  message,
  sessionSnapshot,
  studentDisplayName,
  onEnrol,
  onDrop,
}: ClassDetailsDialogProps) {
  if (!open || !detail) {
    return <Dialog open={open} onClose={onClose} placement="right">{null}</Dialog>;
  }

  const status = fillStatus(detail);
  const durationMinutes = detail.endMinutes - detail.startMinutes;
  const hourlyPrice = detail.hourlyRate
    ? formatPrice(detail.hourlyRate.amount, detail.hourlyRate.currency)
    : null;
  const classPrice =
    detail.hourlyRate && durationMinutes > 0
      ? formatPrice(
          Math.round(detail.hourlyRate.amount * (durationMinutes / 60)),
          detail.hourlyRate.currency,
        )
      : null;
  const slotsRemaining = Math.max(0, detail.effectiveCap - detail.enrolled);
  const ruleLines = detail.rules
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const isStudent = viewerRole === "STUDENT";
  const isEnrolled = Boolean(enrollmentId);
  const isReserved = detail.periodType === "RESERVED";
  const canEnrol = isStudent && !isEnrolled && status !== "full";
  // Calendar past clicks always pass a snapshot (see getOccurrenceSnapshot); hide drop
  // enrollment when viewing that occurrence — including NOT_HELD sessions.
  const showLeaveClass = isStudent && isEnrolled && !sessionSnapshot;

  return (
    <Dialog open={open} onClose={onClose} size="lg" placement="right">
      <Header>
        <TitleRow>
          <Title>{detail.title}</Title>
        </TitleRow>
        <MetaLine>Subject: {detail.subjectName}</MetaLine>
        <MetaLine>Class Type: {formatClassType(detail.periodType)}</MetaLine>
        <Subtitle>Teacher: {detail.teacherName}</Subtitle>
      </Header>

      <StatGrid>
        <Stat
          label="Schedule"
          value={formatRecurrenceLabel(detail.recurrence ?? DEFAULT_OFFERING_RECURRENCE, detail.dayOfWeek)}
        />
        <Stat
          label="Time"
          value={`${minutesToTime(detail.startMinutes)}–${minutesToTime(detail.endMinutes)}`}
        />
        <Stat label="Duration" value={formatDuration(durationMinutes)} />
        <Stat label="Hourly rate" value={hourlyPrice ? `${hourlyPrice}/hr` : "—"} />
        <Stat
          label={isReserved ? "Invite list" : "Class limit"}
          value={isReserved ? `${detail.effectiveCap} invited` : detail.effectiveCap.toString()}
        />
        <Stat label="Currently enrolled" value={detail.enrolled.toString()} />
        <Stat
          label={status === "full" ? "Spots" : "Spots remaining"}
          value={status === "full" ? "Full" : slotsRemaining.toString()}
          emphasised={status === "full"}
        />
        <Stat label="Session total" value={classPrice ?? "—"} />
      </StatGrid>

      {detail.description?.trim() ? (
        <Section>
          <SectionHeading>About this class</SectionHeading>
          <Description>{detail.description}</Description>
        </Section>
      ) : null}

      <DividedSection>
        <DividedSectionHeading>Rules &amp; expectations</DividedSectionHeading>
        {ruleLines.length === 0 ? (
          <Empty>The teacher hasn&apos;t posted specific rules for this class yet.</Empty>
        ) : (
          <RulesList>
            {ruleLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </RulesList>
        )}
      </DividedSection>

      {sessionSnapshot && enrollmentId && isStudent ? (
        <>
          <DividedSection>
            <DividedSectionHeading>Attendance</DividedSectionHeading>
            <SessionStatusPanel snapshot={sessionSnapshot} />
          </DividedSection>
          <DividedSection>
            <DividedSectionHeading>Comments</DividedSectionHeading>
            <CommentsSubsections>
              <CommentSubsection>
                <CommentSubheading>Teacher comment</CommentSubheading>
                <SessionTeacherCommentPanel
                  teacherNote={sessionSnapshot.teacherNote}
                  teacherDisplayName={detail.teacherName}
                  teacherNoteUpdatedAtIso={sessionSnapshot.teacherNoteUpdatedAtIso}
                />
              </CommentSubsection>
              <CommentSubsectionDivider aria-hidden />
              <CommentSubsection>
                <CommentSubheading>Student comment</CommentSubheading>
                <SessionStudentCommentPanel
                  snapshot={sessionSnapshot}
                  enrollmentId={enrollmentId}
                  studentDisplayName={studentDisplayName}
                  canAddComment
                />
              </CommentSubsection>
            </CommentsSubsections>
          </DividedSection>
        </>
      ) : null}

      {message ? <Message $tone={message.tone}>{message.text}</Message> : null}

      <Footer>
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
        {showLeaveClass ? (
          <>
            <JoinClassButton
              offeringId={detail.offeringId}
              dayOfWeek={detail.dayOfWeek}
              startMinutes={detail.startMinutes}
              endMinutes={detail.endMinutes}
              recurrence={detail.recurrence}
            />
            <Button
              type="button"
              variant="destructive"
              isLoading={isBusy}
              onClick={() => enrollmentId && onDrop?.(enrollmentId)}
            >
              Leave class
            </Button>
          </>
        ) : null}
        {canEnrol ? (
          <Button type="button" isLoading={isBusy} onClick={() => onEnrol?.(detail.offeringId)}>
            Enrol in this class
          </Button>
        ) : null}
        {isStudent && !isEnrolled && status === "full" ? (
          <Button type="button" disabled>
            Class full
          </Button>
        ) : null}
      </Footer>
    </Dialog>
  );
}

function Stat({
  label,
  value,
  emphasised,
}: {
  label: string;
  value: string;
  emphasised?: boolean;
}) {
  return (
    <StatBox>
      <StatLabel>{label}</StatLabel>
      <StatValue $emphasised={emphasised}>{value}</StatValue>
    </StatBox>
  );
}

function formatClassType(periodType?: OfferingPeriodType): string {
  return periodType === "RESERVED" ? "Reserved (invite only)" : "Open";
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
