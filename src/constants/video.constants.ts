/**
 * Live class video-call configuration.
 *
 * Mentora embeds Jitsi Meet via its external iframe API. The public
 * `meet.jit.si` instance needs no API keys or account, so live classes work
 * out of the box. To self-host or use a paid 8x8 tenant, override
 * `NEXT_PUBLIC_JITSI_DOMAIN` and the room namespace stays the same.
 */
export const VIDEO = {
  /** Jitsi deployment domain (no protocol). */
  DOMAIN: process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si",
  /** Prefix applied to every generated room slug to namespace Mentora rooms. */
  ROOM_PREFIX: "mentora",
  /** External API loader served by the Jitsi deployment. */
  EXTERNAL_API_PATH: "/external_api.js",
} as const;
