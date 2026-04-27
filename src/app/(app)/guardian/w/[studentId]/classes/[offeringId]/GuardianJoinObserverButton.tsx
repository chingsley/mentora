"use client";

import type { DayOfWeek } from "@prisma/client";
import { useParams } from "next/navigation";
import * as React from "react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { isClassLive } from "@/lib/classSession";
import { DAY_LABEL, minutesToTime } from "@/lib/time";
import { joinAsObserverAction } from "./actions";

export interface GuardianJoinObserverButtonProps {
  enrollmentId: string;
  offeringTitle: string;
  studentName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Message = styled.p<{ $tone: "ok" | "error" }>`
  font-size: 11px;
  ${({ $tone }) =>
    $tone === "ok"
      ? css`
          color: ${COLORS.SUCCESS};
        `
      : css`
          color: ${COLORS.DESTRUCTIVE};
        `}
`;

export function GuardianJoinObserverButton({
  enrollmentId,
  dayOfWeek,
  startMinutes,
  endMinutes,
}: GuardianJoinObserverButtonProps) {
  const params = useParams<{ studentId: string }>();
  const studentProfileId = params?.studentId ?? "";
  const [, setTick] = React.useState(0);
  const [joining, setJoining] = React.useState(false);
  const [message, setMessage] = React.useState<
    { tone: "ok" | "error"; text: string } | null
  >(null);

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), 30_000);
    return () => clearInterval(id);
  }, []);

  const live = isClassLive({ dayOfWeek, startMinutes, endMinutes });

  async function handleJoin() {
    setJoining(true);
    setMessage(null);
    try {
      const res = await joinAsObserverAction({
        studentProfileId,
        enrollmentId,
      });
      if (res.ok) {
        setMessage({
          tone: "ok",
          text: "Joined as observer. The video screen will open here when enabled.",
        });
      } else {
        setMessage({ tone: "error", text: res.error ?? "Could not join" });
      }
    } finally {
      setJoining(false);
    }
  }

  return (
    <Wrap>
      {live ? (
        <Button
          type="button"
          variant="secondary"
          onClick={handleJoin}
          isLoading={joining}
        >
          Join as observer
        </Button>
      ) : (
        <Button type="button" variant="secondary" disabled>
          Next session {DAY_LABEL[dayOfWeek]} · {minutesToTime(startMinutes)}
        </Button>
      )}
      {message ? <Message $tone={message.tone}>{message.text}</Message> : null}
    </Wrap>
  );
}
