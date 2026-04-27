"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { minutesToTime } from "@/lib/time";
import { markAttendanceAction } from "./attendanceActions";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface TodayAttendanceStudent {
  enrollmentId: string;
  studentName: string;
  status: AttendanceStatus | null;
  source: "AUTO_JOIN" | "TEACHER" | null;
}

export interface TodayAttendanceSession {
  offeringId: string;
  offeringTitle: string;
  subjectName: string;
  startMinutes: number;
  endMinutes: number;
  sessionDate: string;
  inJoinWindow: boolean;
  students: TodayAttendanceStudent[];
}

export interface TodayAttendanceProps {
  sessions: TodayAttendanceSession[];
}

const STATUSES: AttendanceStatus[] = ["PRESENT", "LATE", "ABSENT", "EXCUSED"];

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const SessionCard = styled.div`
  border-radius: ${LAYOUT.RADIUS.LG};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.FOUR};
`;

const SessionHeader = styled.div`
  margin-bottom: ${SPACING.THREE};
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
  font-size: 11px;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const TimeText = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const LivePill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid #6ee7b7;
  background-color: #ecfdf5;
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  color: #064e3b;
`;

const Empty = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const StudentList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;

  & > li + li {
    border-top: 1px solid ${COLORS.BORDER};
  }
`;

const StudentRow = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  padding: ${SPACING.THREE} 0;

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const StudentTop = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const StudentName = styled.span`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const StatusBadge = styled.span<{ $status: AttendanceStatus | "unmarked" }>`
  border-radius: ${LAYOUT.RADIUS.FULL};
  padding: 0.125rem ${SPACING.TWO};
  font-size: 11px;
  border: 1px solid;

  ${(p) => {
    switch (p.$status) {
      case "PRESENT":
        return css`
          border-color: #6ee7b7;
          background-color: #ecfdf5;
          color: #064e3b;
        `;
      case "LATE":
        return css`
          border-color: #fcd34d;
          background-color: #fffbeb;
          color: #78350f;
        `;
      case "ABSENT":
        return css`
          border-color: #fda4af;
          background-color: #fff1f2;
          color: #881337;
        `;
      case "EXCUSED":
        return css`
          border-color: #7dd3fc;
          background-color: #f0f9ff;
          color: #0c4a6e;
        `;
      default:
        return css`
          border-color: ${COLORS.BORDER};
          background-color: ${COLORS.BACKGROUND};
          color: ${COLORS.MUTED_FOREGROUND};
        `;
    }
  }}
`;

const SourceText = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.ONE};
`;

const ActionBtn = styled.button<{ $active: boolean }>`
  height: 1.75rem;
  border-radius: ${LAYOUT.RADIUS.MD};
  padding: 0 ${SPACING.TWO};
  font-size: 11px;
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  border: 1px solid;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  ${(p) =>
    p.$active
      ? css`
          border-color: ${COLORS.HEADER};
          background-color: ${COLORS.HEADER};
          color: ${COLORS.WHITE};
        `
      : css`
          border-color: ${COLORS.BORDER};
          background-color: ${COLORS.FOREGROUND};
          color: ${COLORS.HEADER};

          &:hover {
            background-color: rgba(23, 32, 51, 0.06);
          }
        `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  font-size: 11px;
  color: ${COLORS.DESTRUCTIVE};
`;

export function TodayAttendance({ sessions }: TodayAttendanceProps) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function mark(
    enrollmentId: string,
    sessionDate: string,
    status: AttendanceStatus,
  ) {
    const key = `${enrollmentId}:${status}`;
    setPendingKey(key);
    setErrors((prev) => ({ ...prev, [enrollmentId]: "" }));
    const fd = new FormData();
    fd.set("enrollmentId", enrollmentId);
    fd.set("sessionDate", sessionDate);
    fd.set("status", status);
    const res = await markAttendanceAction(fd);
    setPendingKey(null);
    if (!res.ok) {
      setErrors((prev) => ({ ...prev, [enrollmentId]: res.error }));
      return;
    }
    router.refresh();
  }

  if (sessions.length === 0) {
    return <Empty>No classes on your schedule for today.</Empty>;
  }

  return (
    <Wrap>
      {sessions.map((s) => (
        <SessionCard key={s.offeringId}>
          <SessionHeader>
            <SessionTitle>{s.offeringTitle}</SessionTitle>
            <SubjectPill>{s.subjectName}</SubjectPill>
            <TimeText>
              {minutesToTime(s.startMinutes)}–{minutesToTime(s.endMinutes)}
            </TimeText>
            {s.inJoinWindow ? <LivePill>Live now</LivePill> : null}
          </SessionHeader>
          {s.students.length === 0 ? (
            <Empty>No students enrolled.</Empty>
          ) : (
            <StudentList>
              {s.students.map((stu) => (
                <StudentRow key={stu.enrollmentId}>
                  <StudentTop>
                    <StudentName>{stu.studentName}</StudentName>
                    {stu.status ? (
                      <StatusBadge $status={stu.status}>
                        {stu.status.toLowerCase()}
                      </StatusBadge>
                    ) : (
                      <StatusBadge $status="unmarked">unmarked</StatusBadge>
                    )}
                    {stu.source ? (
                      <SourceText>
                        {stu.source === "AUTO_JOIN" ? "auto" : "override"}
                      </SourceText>
                    ) : null}
                  </StudentTop>
                  <ActionRow>
                    {STATUSES.map((st) => {
                      const key = `${stu.enrollmentId}:${st}`;
                      const isActive = stu.status === st;
                      return (
                        <ActionBtn
                          key={st}
                          type="button"
                          $active={isActive}
                          disabled={pendingKey !== null}
                          onClick={() => mark(stu.enrollmentId, s.sessionDate, st)}
                        >
                          {pendingKey === key ? "..." : st.toLowerCase()}
                        </ActionBtn>
                      );
                    })}
                  </ActionRow>
                  {errors[stu.enrollmentId] ? (
                    <ErrorText>{errors[stu.enrollmentId]}</ErrorText>
                  ) : null}
                </StudentRow>
              ))}
            </StudentList>
          )}
        </SessionCard>
      ))}
    </Wrap>
  );
}
