"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { ArrowLeft, Radio, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { buildExternalApiSrc, buildRoomUrl } from "@/lib/videoRoom";
import type { ClassroomAccess, ClassroomView } from "@/server/classSession";
import {
  endClassAction,
  registerStudentJoinAction,
  startClassAction,
} from "./actions";

const STUDENT_HOME = "/classes";
const TEACHER_HOME = "/schedule";
const WAITING_POLL_MS = 20_000;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const TopBar = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.THREE};
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.HALF};
  min-width: 0;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const Subtitle = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const LivePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.DESTRUCTIVE_TINT_10};
  color: ${COLORS.DESTRUCTIVE};
  padding: 0.125rem ${SPACING.TWO};
  font-size: ${FONTS.SIZE.META};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const VideoFrame = styled.div`
  width: 100%;
  height: 70vh;
  min-height: 24rem;
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.XL};
  background-color: ${COLORS.HEADER};
  box-shadow: ${LAYOUT.SHADOW.MD};
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.XL};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.EIGHT};
  text-align: center;
  outline: 1px solid ${COLORS.RING_BLACK_5};
  outline-offset: -1px;
`;

const PanelTitle = styled.h2`
  font-size: ${FONTS.SIZE.BASE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const PanelBody = styled.p`
  max-width: 32rem;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const PanelActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.TWO};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

interface JitsiApiOptions {
  roomName: string;
  parentNode: HTMLElement;
  width?: string | number;
  height?: string | number;
  jwt?: string;
  userInfo?: { displayName?: string };
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
}

interface JitsiApi {
  dispose(): void;
  addEventListener(event: string, listener: (...args: unknown[]) => void): void;
}

type JitsiApiCtor = new (domain: string, options: JitsiApiOptions) => JitsiApi;

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiApiCtor;
  }
}

const scriptPromises = new Map<string, Promise<void>>();

function loadJitsiScript(domain: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  const cached = scriptPromises.get(domain);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = buildExternalApiSrc(domain);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromises.delete(domain);
      reject(new Error("Could not load the video client."));
    };
    document.body.appendChild(script);
  });
  scriptPromises.set(domain, promise);
  return promise;
}

function JitsiRoom({
  access,
  onLeave,
}: {
  access: ClassroomAccess;
  onLeave: () => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const apiRef = React.useRef<JitsiApi | null>(null);
  const onLeaveRef = React.useRef(onLeave);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    onLeaveRef.current = onLeave;
  });

  React.useEffect(() => {
    let disposed = false;
    loadJitsiScript(access.videoDomain)
      .then(() => {
        if (disposed) return;
        const Ctor = window.JitsiMeetExternalAPI;
        if (!Ctor || !containerRef.current) {
          setError("The video client is unavailable right now.");
          return;
        }
        const api = new Ctor(access.videoDomain, {
          roomName: access.roomName,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          ...(access.jwt ? { jwt: access.jwt } : {}),
          userInfo: { displayName: access.displayName },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: !access.isModerator,
            startWithVideoMuted: !access.isModerator,
          },
        });
        api.addEventListener("readyToClose", () => onLeaveRef.current());
        apiRef.current = api;
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Could not load the video client.",
        );
      });

    return () => {
      disposed = true;
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, [
    access.roomName,
    access.displayName,
    access.isModerator,
    access.videoDomain,
    access.jwt,
  ]);

  if (error) {
    return (
      <Panel>
        <PanelTitle>Video unavailable</PanelTitle>
        <PanelBody>{error}</PanelBody>
        <PanelActions>
          <Button
            type="button"
            onClick={() =>
              window.open(
                buildRoomUrl(access.roomName, access.videoDomain),
                "_blank",
              )
            }
          >
            Open call in a new tab
          </Button>
        </PanelActions>
      </Panel>
    );
  }

  return <VideoFrame ref={containerRef} />;
}

function LiveClassroom({ access }: { access: ClassroomAccess }) {
  const router = useRouter();
  const [leaving, setLeaving] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (access.isModerator) return;
    let active = true;
    void registerStudentJoinAction(access.offeringId).then((res) => {
      if (active && !res.ok && res.error) setNotice(res.error);
    });
    return () => {
      active = false;
    };
  }, [access.isModerator, access.offeringId]);

  const leave = React.useCallback(() => {
    setLeaving(true);
    if (access.isModerator) {
      void endClassAction(access.offeringId).finally(() => {
        router.push(TEACHER_HOME);
      });
    } else {
      router.push(STUDENT_HOME);
    }
  }, [access.isModerator, access.offeringId, router]);

  return (
    <Wrap>
      <TopBar>
        <TitleBlock>
          <Title>
            <Video size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
            {access.offeringTitle}
            <LivePill>
              <Radio size={ICON_SIZE.XS} strokeWidth={ICON_STROKE.BOLD} />
              Live
            </LivePill>
          </Title>
          <Subtitle>
            {access.subjectName} · with {access.teacherName}
          </Subtitle>
        </TitleBlock>
        <Button
          type="button"
          variant={access.isModerator ? "destructive" : "secondary"}
          isLoading={leaving}
          onClick={leave}
        >
          {access.isModerator ? "End class" : "Leave class"}
        </Button>
      </TopBar>
      {notice ? <ErrorText>{notice}</ErrorText> : null}
      {access.isDemoEmbed ? (
        <ErrorText>
          Demo video mode disconnects after 5 minutes. Add JaaS credentials to
          your server environment for longer classes.
        </ErrorText>
      ) : null}
      <JitsiRoom access={access} onLeave={leave} />
    </Wrap>
  );
}

function TeacherIdle({
  offeringId,
  offeringTitle,
  canStart,
}: {
  offeringId: string;
  offeringTitle: string;
  canStart: boolean;
}) {
  const router = useRouter();
  const [starting, setStarting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function start() {
    setStarting(true);
    setError(null);
    void startClassAction(offeringId).then((res) => {
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error ?? "Could not start the class.");
        setStarting(false);
      }
    });
  }

  return (
    <Wrap>
      <BackLink href={TEACHER_HOME}>
        <ArrowLeft size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} />
        Back to schedule
      </BackLink>
      <Panel>
        <PanelTitle>Start “{offeringTitle}”</PanelTitle>
        <PanelBody>
          {canStart
            ? "Starting the class opens a video call. Enrolled students can join from their calendar once you're live."
            : "This class isn't in its scheduled time window yet. You can start the call once the class is due to begin."}
        </PanelBody>
        <PanelActions>
          <Button type="button" onClick={start} isLoading={starting} disabled={!canStart}>
            <Video size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} />
            Start class
          </Button>
        </PanelActions>
        {error ? <ErrorText>{error}</ErrorText> : null}
      </Panel>
    </Wrap>
  );
}

function StudentWaiting({
  offeringTitle,
  teacherName,
}: {
  offeringTitle: string;
  teacherName: string;
}) {
  const router = useRouter();

  React.useEffect(() => {
    const id = setInterval(() => router.refresh(), WAITING_POLL_MS);
    return () => clearInterval(id);
  }, [router]);

  return (
    <Wrap>
      <BackLink href={STUDENT_HOME}>
        <ArrowLeft size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} />
        Back to my classes
      </BackLink>
      <Panel>
        <PanelTitle>Waiting for {teacherName}</PanelTitle>
        <PanelBody>
          “{offeringTitle}” hasn&apos;t started yet. This page will update
          automatically when {teacherName} starts the class.
        </PanelBody>
        <PanelActions>
          <Button type="button" variant="secondary" onClick={() => router.refresh()}>
            Check now
          </Button>
        </PanelActions>
      </Panel>
    </Wrap>
  );
}

function Forbidden({ reason }: { reason: string }) {
  return (
    <Wrap>
      <Panel>
        <PanelTitle>Can&apos;t open this class</PanelTitle>
        <PanelBody>{reason}</PanelBody>
        <PanelActions>
          <BackLink href="/dashboard">
            <ArrowLeft size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.MEDIUM} />
            Back to dashboard
          </BackLink>
        </PanelActions>
      </Panel>
    </Wrap>
  );
}

export function ClassroomClient({ view }: { view: ClassroomView }) {
  switch (view.kind) {
    case "live":
      return <LiveClassroom access={view.access} />;
    case "teacher-idle":
      return (
        <TeacherIdle
          offeringId={view.offeringId}
          offeringTitle={view.offeringTitle}
          canStart={view.canStart}
        />
      );
    case "student-waiting":
      return (
        <StudentWaiting
          offeringTitle={view.offeringTitle}
          teacherName={view.teacherName}
        />
      );
    case "forbidden":
      return <Forbidden reason={view.reason} />;
  }
}
