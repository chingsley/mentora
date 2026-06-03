"use client";

import type { AttendanceSource, AttendanceStatus } from "@prisma/client";
import styled from "styled-components";
import {
  TeacherSessionAttendancePanel,
  type SessionAttendanceData,
} from "@/components/features/teacher/TeacherSessionAttendancePanel";
import { normalizeOccurrenceSessionIso } from "@/lib/sessionOccurrenceKey";
import type { AttendanceChangeLogEntry } from "@/server/attendance";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";

export type { AttendanceStatus };

export interface TodayAttendanceStudent {
  enrollmentId: string;
  studentName: string;
  status: AttendanceStatus | null;
  source: AttendanceSource | null;
  joinedAt: Date | string | null;
  teacherNote?: string | null;
  studentNote?: string | null;
  changeLog?: AttendanceChangeLogEntry[];
}

export interface TodayAttendanceSession {
  offeringId: string;
  offeringTitle: string;
  subjectName: string;
  startMinutes: number;
  endMinutes: number;
  sessionDate: string;
  inJoinWindow: boolean;
  sessionOutcome: "HELD" | "NOT_HELD" | null;
  notHeldReason: import("@prisma/client").SessionNotHeldReason | null;
  teacherNote: string | null;
  studentNote: string | null;
  students: TodayAttendanceStudent[];
}

export interface TodayAttendanceProps {
  sessions: TodayAttendanceSession[];
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const Empty = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

function toPanelSession(session: TodayAttendanceSession): SessionAttendanceData {
  return {
    offeringId: session.offeringId,
    offeringTitle: session.offeringTitle,
    subjectName: session.subjectName,
    startMinutes: session.startMinutes,
    endMinutes: session.endMinutes,
    sessionDate: normalizeOccurrenceSessionIso(session.sessionDate),
    inJoinWindow: session.inJoinWindow,
    sessionOutcome: session.sessionOutcome,
    notHeldReason: session.notHeldReason,
    teacherNote: session.teacherNote,
    studentNote: session.studentNote,
    students: session.students,
  };
}

export function TodayAttendance({ sessions }: TodayAttendanceProps) {
  if (sessions.length === 0) {
    return (
      <Empty>
        No sessions are ready for attendance yet. Attendance opens 15 minutes before each
        class starts.
      </Empty>
    );
  }

  return (
    <Wrap>
      {sessions.map((s) => (
        <TeacherSessionAttendancePanel
          key={s.offeringId}
          session={toPanelSession(s)}
        />
      ))}
    </Wrap>
  );
}
