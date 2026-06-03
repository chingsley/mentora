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
export function buildRoomUrl(roomName: string): string {
  return `https://${VIDEO.DOMAIN}/${roomName}`;
}

/** Source URL for the Jitsi external iframe API loader. */
export function buildExternalApiSrc(): string {
  return `https://${VIDEO.DOMAIN}${VIDEO.EXTERNAL_API_PATH}`;
}
