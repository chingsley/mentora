import "server-only";

export interface VideoSession {
  sessionId: string;
  joinUrl: string;
  expiresAt: Date;
}

export interface AttendanceEvent {
  userId: string;
  kind: "join" | "leave";
  at: Date;
}

export interface VideoProvider {
  /** Create (or fetch existing) session for a class offering at a given period. */
  createSession(args: { offeringId: string; startsAt: Date }): Promise<VideoSession>;
  /** Produce a join URL for a specific user in an existing session. */
  joinUrlFor(args: { sessionId: string; userId: string; role: "teacher" | "student" }): Promise<string>;
  /**
   * Return raw presence events for a session. In real impls this will come from
   * the provider's webhook + our own DB aggregation.
   */
  presenceEvents(sessionId: string): Promise<AttendanceEvent[]>;
}

/** No-op implementation used during MVP. Emits a local placeholder join URL. */
export class NoopVideoProvider implements VideoProvider {
  async createSession({ offeringId, startsAt }: { offeringId: string; startsAt: Date }) {
    const sessionId = `noop-${offeringId}-${startsAt.getTime()}`;
    return {
      sessionId,
      joinUrl: `/classroom/${sessionId}`,
      expiresAt: new Date(startsAt.getTime() + 1000 * 60 * 60 * 4),
    };
  }

  async joinUrlFor({ sessionId }: { sessionId: string }) {
    return `/classroom/${sessionId}`;
  }

  async presenceEvents(): Promise<AttendanceEvent[]> {
    return [];
  }
}

export const videoProvider: VideoProvider = new NoopVideoProvider();
