"use client";

import type { DayOfWeek, Role } from "@prisma/client";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { DAY_LABEL, formatPrice, minutesToTime } from "@/lib/time";
import { FILL_LABEL, FILL_THEME, fillStatus } from "@/components/features/calendar/types";
import { JoinClassButton } from "@/components/features/student/JoinClassButton";

export interface ClassDetailTestimonial {
  id: string;
  rating: number;
  body: string;
  createdAt: string | Date;
  studentName: string;
}

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
  hourlyRate: { amount: number; currency: string } | null;
  rules: string;
  description?: string | null;
  testimonials: ClassDetailTestimonial[];
}

export interface ClassDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  detail: ClassDetail | null;
  viewerRole: Role;
  viewerName: string | null;
  enrollmentId: string | null;
  isBusy?: boolean;
  message?: { tone: "success" | "error"; text: string } | null;
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

const StatusPill = styled.span<{ $status: keyof typeof FILL_THEME }>`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${(p) => FILL_THEME[p.$status].border};
  background-color: ${(p) => FILL_THEME[p.$status].bg};
  color: ${(p) => FILL_THEME[p.$status].text};
  padding: 0.125rem ${SPACING.TWO};
  font-size: 0.6875rem;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
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
  font-size: 0.6875rem;
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

const SectionHeading = styled.h3`
  margin-bottom: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const SectionHeadingTight = styled(SectionHeading)`
  margin-bottom: ${SPACING.TWO};
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

const TestimonialList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const TestimonialCard = styled.li`
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.THREE};
`;

const TestimonialHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TestimonialName = styled.p`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const TestimonialStars = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: #b45309;
`;

const StarsMuted = styled.span`
  color: ${COLORS.MUTED_FOREGROUND};
`;

const TestimonialBody = styled.p`
  margin-top: ${SPACING.ONE};
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
  viewerName,
  enrollmentId,
  isBusy,
  message,
  onEnrol,
  onDrop,
}: ClassDetailsDialogProps) {
  if (!open || !detail) {
    return <Dialog open={open} onClose={onClose}>{null}</Dialog>;
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
  const canEnrol = isStudent && !isEnrolled && status !== "full";

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <Header>
        <TitleRow>
          <Title>{detail.title}</Title>
          <StatusPill $status={status}>{FILL_LABEL[status]}</StatusPill>
        </TitleRow>
        <Subtitle>
          {detail.subjectName} · with {detail.teacherName}
        </Subtitle>
      </Header>

      <StatGrid>
        <Stat label="Day" value={DAY_LABEL[detail.dayOfWeek]} />
        <Stat
          label="Time"
          value={`${minutesToTime(detail.startMinutes)}–${minutesToTime(detail.endMinutes)}`}
        />
        <Stat label="Duration" value={formatDuration(durationMinutes)} />
        <Stat label="Hourly rate" value={hourlyPrice ? `${hourlyPrice}/hr` : "—"} />
        <Stat label="Class limit" value={detail.effectiveCap.toString()} />
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

      <Section>
        <SectionHeadingTight>Rules &amp; expectations</SectionHeadingTight>
        {ruleLines.length === 0 ? (
          <Empty>The teacher hasn&apos;t posted specific rules for this class yet.</Empty>
        ) : (
          <RulesList>
            {ruleLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </RulesList>
        )}
      </Section>

      <Section>
        <SectionHeadingTight>What previous students said</SectionHeadingTight>
        {detail.testimonials.length === 0 ? (
          <Empty>No testimonials yet. Be the first to share feedback.</Empty>
        ) : (
          <TestimonialList>
            {detail.testimonials.slice(0, 5).map((t) => (
              <TestimonialCard key={t.id}>
                <TestimonialHead>
                  <TestimonialName>{t.studentName}</TestimonialName>
                  <TestimonialStars aria-label={`${t.rating} out of 5`}>
                    {"★".repeat(t.rating)}
                    <StarsMuted>{"★".repeat(5 - t.rating)}</StarsMuted>
                  </TestimonialStars>
                </TestimonialHead>
                <TestimonialBody>{t.body}</TestimonialBody>
              </TestimonialCard>
            ))}
          </TestimonialList>
        )}
      </Section>

      {message ? <Message $tone={message.tone}>{message.text}</Message> : null}

      <Footer>
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
        {isStudent && isEnrolled ? (
          <>
            <JoinClassButton
              offeringId={detail.offeringId}
              offeringTitle={detail.title}
              studentName={viewerName ?? "Student"}
              dayOfWeek={detail.dayOfWeek}
              startMinutes={detail.startMinutes}
              endMinutes={detail.endMinutes}
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

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
