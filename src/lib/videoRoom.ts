import { VIDEO } from "@/constants/video.constants";

/**
 * Generate an unguessable room slug for a live class session. The randomness
 * (not the offering id) is what gates access, so a leaked schedule can't be
 * used to crash a call.
 */
export function generateRoomName(): string {
  const random = globalThis.crypto.randomUUID().replace(/-/g, "");
  return `${VIDEO.ROOM_PREFIX}-${random}`;
}

/** Absolute fallback URL to open a room directly in the Jitsi web client. */
export function buildRoomUrl(roomName: string, domain: string = VIDEO.DEMO_DOMAIN): string {
  return `https://${domain}/${roomName}`;
}

/** Source URL for the Jitsi external iframe API loader. */
export function buildExternalApiSrc(domain: string = VIDEO.DEMO_DOMAIN): string {
  return `https://${domain}${VIDEO.EXTERNAL_API_PATH}`;
}

/** JaaS requires the tenant-scoped loader, not the bare 8x8.vc script. */
export function buildJaasExternalApiSrc(appId: string, domain = "8x8.vc"): string {
  return `https://${domain}/${appId}${VIDEO.EXTERNAL_API_PATH}`;
}
