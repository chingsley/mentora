import "server-only";
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { serverEnv } from "@/lib/env";
import { buildExternalApiSrc, buildJaasExternalApiSrc } from "@/lib/videoRoom";

/** JaaS meetings are hosted on 8x8 infrastructure, not meet.jit.si. */
export const JAAS_DOMAIN = "8x8.vc";

/** How long a signed meeting token stays valid (2 hours). */
const JWT_TTL_SECONDS = 2 * 60 * 60;

export interface VideoCallCredentials {
  domain: string;
  roomName: string;
  externalApiSrc: string;
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

function resolvePrivateKeyPem(): string | undefined {
  if (serverEnv.JITSI_JAAS_PRIVATE_KEY) {
    return normalizePrivateKey(serverEnv.JITSI_JAAS_PRIVATE_KEY);
  }
  const keyPath = serverEnv.JITSI_JAAS_PRIVATE_KEY_PATH;
  if (!keyPath) return undefined;

  const resolved = path.isAbsolute(keyPath)
    ? keyPath
    : path.resolve(process.cwd(), keyPath);
  const projectRoot = process.cwd();
  if (!resolved.startsWith(projectRoot + path.sep) && resolved !== projectRoot) {
    throw new Error("JITSI_JAAS_PRIVATE_KEY_PATH must stay within the project directory.");
  }
  return normalizePrivateKey(readFileSync(resolved, "utf8"));
}

export function isJaasConfigured(): boolean {
  return Boolean(
    serverEnv.JITSI_JAAS_APP_ID &&
      serverEnv.JITSI_JAAS_API_KEY &&
      resolvePrivateKeyPem(),
  );
}

function signJaasJwt(args: {
  appId: string;
  apiKey: string;
  privateKey: string;
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
    // Wildcard avoids literal room-name mismatches (8x8 iframe API example).
    room: "*",
    exp: nowSeconds + JWT_TTL_SECONDS,
    nbf: nowSeconds - 10,
    context: {
      user: {
        id: args.userId,
        name: args.displayName,
        moderator: args.isModerator ? "true" : "false",
      },
      features: {
        livestreaming: false,
        recording: false,
        transcription: false,
        "outbound-call": false,
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

/** Mint a short-lived JaaS JWT for an authorized classroom participant. */
export function mintJaasJwt(args: {
  roomName: string;
  userId: string;
  displayName: string;
  isModerator: boolean;
}): string {
  const privateKey = resolvePrivateKeyPem();
  if (!privateKey || !serverEnv.JITSI_JAAS_APP_ID || !serverEnv.JITSI_JAAS_API_KEY) {
    throw new Error("JaaS is not fully configured.");
  }
  return signJaasJwt({
    appId: serverEnv.JITSI_JAAS_APP_ID,
    apiKey: serverEnv.JITSI_JAAS_API_KEY,
    privateKey,
    userId: args.userId,
    displayName: args.displayName,
    isModerator: args.isModerator,
  });
}

/** Resolve domain and room name for the live classroom embed (JWT minted separately). */
export function buildVideoCallCredentials(
  args: BuildVideoCallCredentialsArgs,
): VideoCallCredentials {
  if (isJaasConfigured()) {
    const appId = serverEnv.JITSI_JAAS_APP_ID!;
    const roomName = `${appId}/${args.roomSlug}`;
    return {
      domain: JAAS_DOMAIN,
      roomName,
      externalApiSrc: buildJaasExternalApiSrc(appId),
      isDemoEmbed: false,
    };
  }

  const domain = serverEnv.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si";
  return {
    domain,
    roomName: args.roomSlug,
    externalApiSrc: buildExternalApiSrc(domain),
    isDemoEmbed: domain === "meet.jit.si",
  };
}
