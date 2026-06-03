"use client";

import type { AttendanceSource, AttendanceStatus, SessionNotHeldReason } from "@prisma/client";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  ATTENDANCE_STATUS_LABEL,
} from "@/constants/attendance.constants";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { FORM_FIELD } from "@/constants/formField.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { minutesToTime } from "@/lib/time";
import { normalizeOccurrenceSessionIso } from "@/lib/sessionOccurrenceKey";
import type { AttendanceChangeLogEntry } from "@/server/attendance";
import { markAttendanceAction } from "@/app/(app)/schedule/attendanceActions";

export interface SessionAttendanceStudent {
  enrollmentId: string;
  studentName: string;
  status: AttendanceStatus | null;
  source: AttendanceSource | null;
  joinedAt: Date | string | null;
  teacherNote?: string | null;
  studentNote?: string | null;
  changeLog?: AttendanceChangeLogEntry[];
}

export interface SessionAttendanceData {
  offeringId: string;
  offeringTitle: string;
  subjectName: string;
  startMinutes: number;
  endMinutes: number;
  sessionDate: string;
  inJoinWindow: boolean;
  sessionOutcome: "HELD" | "NOT_HELD" | null;
  notHeldReason: SessionNotHeldReason | null;
  teacherNote: string | null;
  studentNote: string | null;
  students: SessionAttendanceStudent[];
}

const STATUSES: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];

const STATUS_OPTIONS = STATUSES.map((status) => ({
  value: status,
  label: ATTENDANCE_STATUS_LABEL[status],
}));

const UNMARKED_VALUE = "";

const ROSTER_GRID_COLUMNS =
  "minmax(0, 1.1fr) minmax(7.5rem, 0.85fr) minmax(0, 1.4fr) auto";

const SessionCard = styled.div<{ $compact: boolean; }>`
  ${(p) =>
    p.$compact
      ? css`
          margin-top: ${SPACING.TEN};
          border: none;
          border-top: 1px solid ${COLORS.BORDER};
          padding: ${SPACING.FOUR} 0 0;
          background-color: ${COLORS.TRANSPARENT};
        `
      : css`
          border-radius: ${LAYOUT.RADIUS.LG};
          border: 1px solid ${COLORS.BORDER};
          background-color: ${COLORS.FOREGROUND};
          padding: ${SPACING.FOUR};
        `}
`;

const SessionHeader = styled.div`
  margin-bottom: ${SPACING.FOUR};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const SessionTitle = styled.h3`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const SubjectPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.META};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const TimeText = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const LivePill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.STATUS_PRESENT_BG};
  background-color: ${COLORS.STATUS_PRESENT_BG};
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.META};
  color: ${COLORS.STATUS_PRESENT_TEXT};
`;

const Empty = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Roster = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    display: grid;
    grid-template-columns: ${ROSTER_GRID_COLUMNS};
    column-gap: ${SPACING.TWO};
    row-gap: ${SPACING.TWO};
  }
`;

const RosterHead = styled.div<{ $compact: boolean; }>`
  display: none;
  padding: 0 ${(p) => (p.$compact ? 0 : SPACING.ONE)};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
  text-transform: uppercase;
  letter-spacing: 0.04em;

  ${LAYOUT.MEDIA.SM} {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
  }
`;

const RosterHeadLabel = styled.span`
  justify-self: start;
  text-align: left;
`;

const StudentRow = styled.div<{ $compact: boolean; }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${SPACING.TWO};

  ${(p) =>
    p.$compact
      ? css`
          padding: ${SPACING.THREE} 0;
          border: none;
          border-bottom: 1px solid ${COLORS.BORDER_SUBTLE_LIGHT};
          border-radius: 0;
          background-color: ${COLORS.TRANSPARENT};

          &:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
        `
      : css`
          padding: ${SPACING.THREE};
          border-radius: ${LAYOUT.RADIUS.MD};
          border: 1px solid ${COLORS.BORDER_SUBTLE_LIGHT};
          background-color: ${COLORS.BACKGROUND};
        `}

  ${LAYOUT.MEDIA.SM} {
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: end;
  }
`;

const NameCell = styled.div`
  min-width: 0;
  justify-self: start;

  ${LAYOUT.MEDIA.SM} {
    align-self: center;
  }
`;

const ControlCell = styled.div`
  min-width: 0;
  justify-self: stretch;
  width: 100%;
`;

const RosterInput = styled(Input)`
  input {
    background-color: ${FORM_FIELD.CONTROL_BACKGROUND};
  }
`;

const StudentName = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const FieldLabel = styled.span`
  display: block;
  margin-bottom: ${SPACING.HALF};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};

  ${LAYOUT.MEDIA.SM} {
    display: none;
  }
`;

const SaveCell = styled.div`
  display: flex;
  align-items: flex-end;
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.META};
  color: ${COLORS.DESTRUCTIVE};
  grid-column: 1 / -1;
`;

interface StudentDraft {
  status: AttendanceStatus | typeof UNMARKED_VALUE;
  comment: string;
}

function draftsFromSession(students: SessionAttendanceStudent[]): Record<string, StudentDraft> {
  const next: Record<string, StudentDraft> = {};
  for (const stu of students) {
    next[stu.enrollmentId] = {
      status: stu.status ?? UNMARKED_VALUE,
      comment: stu.teacherNote ?? "",
    };
  }
  return next;
}

function rosterSignature(students: SessionAttendanceStudent[]): string {
  return students
    .map((s) => `${s.enrollmentId}:${s.status ?? ""}:${s.teacherNote ?? ""}`)
    .sort()
    .join("|");
}

export interface TeacherSessionAttendancePanelProps {
  session: SessionAttendanceData;
  onUpdated?: () => void | Promise<void>;
  compactHeader?: boolean;
}

export function TeacherSessionAttendancePanel({
  session,
  onUpdated,
  compactHeader = false,
}: TeacherSessionAttendancePanelProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [drafts, setDrafts] = React.useState<Record<string, StudentDraft>>(() =>
    draftsFromSession(session.students),
  );

  const rosterSig = rosterSignature(session.students);

  React.useEffect(() => {
    setDrafts(draftsFromSession(session.students));
    setErrors({});
  }, [session.sessionDate, session.offeringId, rosterSig]);

  function updateDraft(enrollmentId: string, patch: Partial<StudentDraft>) {
    setDrafts((prev) => {
      const current = prev[enrollmentId];
      if (!current) return prev;
      return {
        ...prev,
        [enrollmentId]: { ...current, ...patch },
      };
    });
    setErrors((prev) => ({ ...prev, [enrollmentId]: "" }));
  }

  async function saveStudent(enrollmentId: string) {
    const draft = drafts[enrollmentId];
    if (!draft) return;

    if (draft.status === UNMARKED_VALUE) {
      setErrors((prev) => ({
        ...prev,
        [enrollmentId]: "Choose an attendance status",
      }));
      return;
    }
    if (!draft.comment.trim()) {
      setErrors((prev) => ({
        ...prev,
        [enrollmentId]: "Add a short comment before saving",
      }));
      return;
    }

    setPendingId(enrollmentId);
    const savedStatus = draft.status;
    const savedComment = draft.comment.trim();
    const fd = new FormData();
    fd.set("enrollmentId", enrollmentId);
    fd.set("sessionDate", normalizeOccurrenceSessionIso(session.sessionDate));
    fd.set("status", savedStatus);
    fd.set("comment", savedComment);
    try {
      const res = await markAttendanceAction(fd);
      if (!res.ok) {
        setErrors((prev) => ({ ...prev, [enrollmentId]: res.error }));
        return;
      }
      setDrafts((prev) => ({
        ...prev,
        [enrollmentId]: { status: savedStatus, comment: savedComment },
      }));
      if (onUpdated) await onUpdated();
      router.refresh();
    } catch {
      setErrors((prev) => ({
        ...prev,
        [enrollmentId]: "Could not save. Check your connection and try again.",
      }));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <SessionCard $compact={compactHeader}>
      {!compactHeader ? (
        <SessionHeader>
          <SessionTitle>{session.offeringTitle}</SessionTitle>
          <SubjectPill>{session.subjectName}</SubjectPill>
          <TimeText>
            {minutesToTime(session.startMinutes)}–{minutesToTime(session.endMinutes)}
          </TimeText>
          {session.inJoinWindow ? <LivePill>In session</LivePill> : null}
        </SessionHeader>
      ) : null}

      {session.students.length === 0 ? (
        <Empty>No students enrolled.</Empty>
      ) : (
        <Roster>
          <RosterHead $compact={compactHeader} aria-hidden>
            <RosterHeadLabel>Student</RosterHeadLabel>
            <RosterHeadLabel>Attendance</RosterHeadLabel>
            <RosterHeadLabel>Teacher comment</RosterHeadLabel>
            <span aria-hidden />
          </RosterHead>
          {session.students.map((stu) => {
            const draft = drafts[stu.enrollmentId];
            if (!draft) return null;
            return (
              <StudentRow key={stu.enrollmentId} $compact={compactHeader}>
                <NameCell>
                  <FieldLabel>Student</FieldLabel>
                  <StudentName>{stu.studentName}</StudentName>
                </NameCell>
                <ControlCell>
                  <Select
                    aria-label={`Attendance for ${stu.studentName}`}
                    value={draft.status}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateDraft(stu.enrollmentId, {
                        status:
                          value === UNMARKED_VALUE
                            ? UNMARKED_VALUE
                            : (value as AttendanceStatus),
                      });
                    }}
                    options={[
                      { value: UNMARKED_VALUE, label: "Unmarked" },
                      ...STATUS_OPTIONS,
                    ]}
                    disabled={pendingId !== null}
                  />
                </ControlCell>
                <ControlCell>
                  <FieldLabel>Comment</FieldLabel>
                  <RosterInput
                    value={draft.comment}
                    onChange={(e) =>
                      updateDraft(stu.enrollmentId, { comment: e.target.value })
                    }
                    placeholder="Brief note for this update…"
                    aria-label={`Comment for ${stu.studentName}`}
                    disabled={pendingId !== null}
                  />
                </ControlCell>
                <SaveCell>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={pendingId !== null}
                    isLoading={pendingId === stu.enrollmentId}
                    onClick={() => saveStudent(stu.enrollmentId)}
                  >
                    Save
                  </Button>
                </SaveCell>
                {errors[stu.enrollmentId] ? (
                  <ErrorText>{errors[stu.enrollmentId]}</ErrorText>
                ) : null}
              </StudentRow>
            );
          })}
        </Roster>
      )}
    </SessionCard>
  );
}
