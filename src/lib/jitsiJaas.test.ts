import { createSign, generateKeyPairSync } from "node:crypto";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

function base64UrlEncode(value: string | Buffer): string {
  const buffer = typeof value === "string" ? Buffer.from(value, "utf8") : value;
  return buffer.toString("base64url");
}

function signTestJwt(args: {
  appId: string;
  apiKey: string;
  roomName: string;
  userId: string;
  displayName: string;
  isModerator: boolean;
}): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT", kid: args.apiKey };
  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: args.appId,
    room: args.roomName,
    exp: nowSeconds + 7200,
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
  const signature = signer.sign(privateKey);
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

describe("JaaS JWT signing", () => {
  it("produces a three-part RS256 token with expected claims", () => {
    const token = signTestJwt({
      appId: "vpaas-magic-cookie-test",
      apiKey: "test-api-key",
      roomName: "vpaas-magic-cookie-test/mentora-abc123",
      userId: "user-1",
      displayName: "Ada Lovelace",
      isModerator: true,
    });

    const parts = token.split(".");
    expect(parts).toHaveLength(3);
    const payloadPart = parts[1];
    if (!payloadPart) throw new Error("missing JWT payload");

    const payload = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf8"),
    ) as {
      aud: string;
      sub: string;
      room: string;
      context: { user: { moderator: string; name: string } };
    };

    expect(payload.aud).toBe("jitsi");
    expect(payload.sub).toBe("vpaas-magic-cookie-test");
    expect(payload.room).toBe("vpaas-magic-cookie-test/mentora-abc123");
    expect(payload.context.user.name).toBe("Ada Lovelace");
    expect(payload.context.user.moderator).toBe("true");
    expect(publicKey).toContain("BEGIN PUBLIC KEY");
  });
});
