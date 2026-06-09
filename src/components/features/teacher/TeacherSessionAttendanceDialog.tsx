"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Settings2 } from "lucide-react";
import { startClassAction } from "@/app/(app)/classroom/[offeringId]/actions";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import {
  TeacherSessionAttendancePanel,
  type SessionAttendanceData,
} from "@/components/features/teacher/TeacherSessionAttendancePanel";
import {
  getTeacherSessionAttendanceAction,
  type TeacherSessionAttendancePayload,
} from "@/app/(app)/schedule/attendanceActions";
import { isClassLive } from "@/lib/classSession";
import { recurrenceFromDb } from "@/lib/offeringRecurrence";
import { canTakeSessionAttendance } from "@/lib/sessionAttendance";
import {
  formatSessionJoinSummary,
  summarizeSessionJoins,
} from "@/lib/sessionAttendanceSummary";
import {
  isPastSessionEnd,
  normalizeOccurrenceSessionIso,
  sessionDateFromCalendarDate,
} from "@/lib/sessionOccurrenceKey";
import { minutesToTime } from "@/lib/time";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import type { TeacherOfferingCalendarOffering } from "@/components/features/teacher/TeacherOfferingCalendar";

export interface TeacherSessionAttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  offering: TeacherOfferingCalendarOffering | null;
  sessionDate: Date | null;
  onEditSchedule?: (offering: TeacherOfferingCalendarOffering) => void;
}

const LoadingText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const UnavailableText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const SessionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  margin-bottom: ${SPACING.FOUR};
`;

const InfoSubject = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const TitleStatus = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
`;

const InfoStats = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const LivePill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.STATUS_PRESENT_BG};
  background-color: ${COLORS.STATUS_PRESENT_BG};
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.STATUS_PRESENT_TEXT};
`;

const EndedPill = styled.span`
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const DialogActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
  margin-bottom: ${SPACING.FOUR};
`;

interface SessionInfoBlockProps {
  subjectName: string;
  statsLine: string | null;
  statsPending?: boolean;
}

function SessionInfoBlock({ subjectName, statsLine, statsPending }: SessionInfoBlockProps) {
  return (
    <SessionInfo>
      <InfoSubject>{subjectName}</InfoSubject>
      {statsLine ? <InfoStats>{statsLine}</InfoStats> : null}
      {statsPending ? <InfoStats>Loading attendance…</InfoStats> : null}
    </SessionInfo>
  );
}

function toSessionAttendanceData(raw: TeacherSessionAttendancePayload): SessionAttendanceData {
  return {
    offeringId: raw.offeringId,
    offeringTitle: raw.offeringTitle,
    subjectName: raw.subjectName,
    startMinutes: raw.startMinutes,
    endMinutes: raw.endMinutes,
    sessionDate: normalizeOccurrenceSessionIso(raw.sessionDate),
    inJoinWindow: raw.inJoinWindow,
    sessionOutcome: raw.sessionOutcome,
    notHeldReason: raw.notHeldReason,
    teacherNote: raw.teacherNote,
    studentNote: raw.studentNote,
    students: raw.students.map((stu) => ({
      enrollmentId: stu.enrollmentId,
      studentName: stu.studentName,
      status: stu.status,
      source: stu.source,
      joinedAt: stu.joinedAt ?? null,
      teacherNote: stu.teacherNote,
      studentNote: stu.studentNote,
      changeLog: stu.changeLog.map((log) => ({
        ...log,
        createdAt: new Date(log.createdAt),
      })),
    })),
  };
}

export function TeacherSessionAttendanceDialog({
  open,
  onClose,
  offering,
  sessionDate,
  onEditSchedule,
}: TeacherSessionAttendanceDialogProps) {
  const router = useRouter();
  const [session, setSession] = React.useState<SessionAttendanceData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [startingClass, setStartingClass] = React.useState(false);
  const [startClassError, setStartClassError] = React.useState<string | null>(null);

  const sessionDateIso = React.useMemo(() => {
    if (!offering || !sessionDate) return null;
    return sessionDateFromCalendarDate(sessionDate, offering.startMinutes).toISOString();
  }, [offering, sessionDate]);

  const attendanceAvailable = React.useMemo(() => {
    if (!offering || !sessionDate) return false;
    return canTakeSessionAttendance(sessionDate, offering.startMinutes);
  }, [offering, sessionDate]);

  const isPastSession = React.useMemo(() => {
    if (!offering || !sessionDate) return false;
    return isPastSessionEnd(sessionDate, offering.endMinutes);
  }, [offering, sessionDate]);

  const classLive = React.useMemo(() => {
    if (!offering) return false;
    return isClassLive({
      dayOfWeek: offering.dayOfWeek,
      startMinutes: offering.startMinutes,
      endMinutes: offering.endMinutes,
      recurrence: recurrenceFromDb({
        recurrenceKind: offering.recurrenceKind,
        recurrenceAnchorDate: offering.recurrenceAnchorDate,
        recurrenceOrdinal: offering.recurrenceOrdinal,
      }),
    });
  }, [offering]);

  function handleStartClass() {
    if (!offering) return;
    setStartingClass(true);
    setStartClassError(null);
    void startClassAction(offering.id).then((res) => {
      if (res.ok) {
        router.push(`/classroom/${offering.id}`);
        return;
      }
      setStartClassError(res.error ?? "Could not start the class.");
      setStartingClass(false);
    });
  }

  const loadSession = React.useCallback(async () => {
    if (!offering || !sessionDateIso) return;
    setLoading(true);
    setError(null);
    const res = await getTeacherSessionAttendanceAction(offering.id, sessionDateIso);
    setLoading(false);
    if (!res.ok) {
      setSession(null);
      setError(res.error);
      return;
    }
    setSession(toSessionAttendanceData(res.data));
  }, [offering, sessionDateIso]);

  React.useEffect(() => {
    if (!open) {
      setSession(null);
      setError(null);
      setStartingClass(false);
      setStartClassError(null);
      return;
    }
    if (!attendanceAvailable) {
      setSession(null);
      setError(null);
      setLoading(false);
      return;
    }
    loadSession();
  }, [open, attendanceAvailable, loadSession]);

  const dialogTitle =
    offering && sessionDate
      ? `${offering.title} · ${sessionDate.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })} · ${minutesToTime(offering.startMinutes)}–${minutesToTime(offering.endMinutes)}`
      : "Session attendance";

  const statsLine = React.useMemo(() => {
    if (!session) return null;
    return formatSessionJoinSummary(summarizeSessionJoins(session.students));
  }, [session]);

  const statsPending = attendanceAvailable && loading && !session;

  const showLive = Boolean(session?.inJoinWindow);
  const showEnded = isPastSession && !showLive;

  const titleBelow =
    showEnded || showLive ? (
      <TitleStatus>
        {showEnded ? <EndedPill>Session ended</EndedPill> : null}
        {showLive ? <LivePill>In session</LivePill> : null}
      </TitleStatus>
    ) : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={dialogTitle}
      titleBelow={titleBelow}
      size="lg"
    >
      {offering ? (
        <SessionInfoBlock
          subjectName={session?.subjectName ?? offering.subjectName}
          statsLine={statsLine}
          statsPending={statsPending}
        />
      ) : null}

      {offering && !isPastSession && (classLive || onEditSchedule) ? (
        <DialogActions>
          {classLive ? (
            <Button
              type="button"
              onClick={handleStartClass}
              isLoading={startingClass}
            >
              Start class
            </Button>
          ) : null}
          {onEditSchedule ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onEditSchedule(offering)}
            >
              <Settings2 size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.NORMAL} aria-hidden />
              Edit class schedule
            </Button>
          ) : null}
        </DialogActions>
      ) : null}

      {startClassError ? <ErrorText>{startClassError}</ErrorText> : null}

      {!attendanceAvailable && offering && sessionDate && !isPastSession ? (
        <UnavailableText>
          Attendance opens 15 minutes before this session starts. Use Edit class schedule to
          change the period.
        </UnavailableText>
      ) : null}
      {attendanceAvailable && loading ? <LoadingText>Loading attendance…</LoadingText> : null}
      {attendanceAvailable && error ? <ErrorText>{error}</ErrorText> : null}
      {attendanceAvailable && session && sessionDateIso ? (
        <TeacherSessionAttendancePanel
          session={session}
          compactHeader
          onUpdated={loadSession}
        />
      ) : null}
    </Dialog>
  );
}
