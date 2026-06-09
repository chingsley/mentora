import "server-only";
import { createSign } from "node:crypto";
import { serverEnv } from "@/lib/env";

/** JaaS meetings are hosted on 8x8 infrastructure, not meet.jit.si. */
export const JAAS_DOMAIN = "8x8.vc";

/** How long a signed meeting token stays valid (2 hours). */
const JWT_TTL_SECONDS = 2 * 60 * 60;

export interface VideoCallCredentials {
  domain: string;
  roomName: string;
  jwt?: string;
  /** True when embedding the public meet.jit.si demo (5-minute cap). */
  isDemoEmbed: boolean;
}

export interface BuildVideoCallCredentialsArgs {
  roomSlug: string;
  userId: string;
  displayName: string;
  isModerator: boolean;
}

function base64UrlEncode(value: string | Buffer): string {
  const buffer = typeof value === "string" ? Buffer.from(value, "utf8") : value;
  return buffer.toString("base64url");
}

function normalizePrivateKey(pem: string): string {
  return pem.replace(/\\n/g, "\n").trim();
}

export function isJaasConfigured(): boolean {
  return Boolean(
    serverEnv.JITSI_JAAS_APP_ID &&
      serverEnv.JITSI_JAAS_API_KEY &&
      serverEnv.JITSI_JAAS_PRIVATE_KEY,
  );
}

function signJaasJwt(args: {
  appId: string;
  apiKey: string;
  privateKey: string;
  roomName: string;
  userId: string;
  displayName: string;
  isModerator: boolean;
}): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: args.apiKey,
  };
  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: args.appId,
    room: args.roomName,
    exp: nowSeconds + JWT_TTL_SECONDS,
    nbf: nowSeconds - 10,
    context: {
      user: {
        id: args.userId,
        name: args.displayName,
        moderator: args.isModerator ? "true" : "false",
      },
    },
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(normalizePrivateKey(args.privateKey));
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

/** Resolve domain, room name, and optional JWT for the live classroom embed. */
export function buildVideoCallCredentials(
  args: BuildVideoCallCredentialsArgs,
): VideoCallCredentials {
  if (isJaasConfigured()) {
    const appId = serverEnv.JITSI_JAAS_APP_ID!;
    const roomName = `${appId}/${args.roomSlug}`;
    return {
      domain: JAAS_DOMAIN,
      roomName,
      jwt: signJaasJwt({
        appId,
        apiKey: serverEnv.JITSI_JAAS_API_KEY!,
        privateKey: serverEnv.JITSI_JAAS_PRIVATE_KEY!,
        roomName,
        userId: args.userId,
        displayName: args.displayName,
        isModerator: args.isModerator,
      }),
      isDemoEmbed: false,
    };
  }

  const domain = serverEnv.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si";
  return {
    domain,
    roomName: args.roomSlug,
    isDemoEmbed: domain === "meet.jit.si",
  };
}
