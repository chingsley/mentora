/**
 * Live class video-call configuration.
 *
 * Embedded calls on the public `meet.jit.si` host disconnect after 5 minutes.
 * For production (1+ hour classes), configure JaaS on the server
 * (`JITSI_JAAS_*` env vars) or point `NEXT_PUBLIC_JITSI_DOMAIN` at a
 * self-hosted Jitsi deployment.
 */
export const VIDEO = {
  /** Default Jitsi domain when no server credentials are configured. */
  DEMO_DOMAIN: "meet.jit.si",
  /** Prefix applied to every generated room slug to namespace Mentora rooms. */
  ROOM_PREFIX: "mentora",
  /** External API loader served by the Jitsi deployment. */
  EXTERNAL_API_PATH: "/external_api.js",
} as const;
