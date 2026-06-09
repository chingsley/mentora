import { z } from "zod";
import { readPortFromEnv } from "@/lib/localOrigin";

const serverSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z
      .string()
      .optional()
      .transform((s) => readPortFromEnv(s)),
    DATABASE_URL: z.string().url().optional(),
    AUTH_SECRET: z.string().min(16).optional(),
    EMAIL_FROM: z.string().email().default("no-reply@mentora.local"),
    SEED_ADMIN_EMAIL: z.string().email().default("admin@mentora.local"),
    SEED_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!"),
    /** Self-hosted Jitsi domain (no protocol). Ignored when JaaS credentials are set. */
    NEXT_PUBLIC_JITSI_DOMAIN: z.string().min(1).optional(),
    /** JaaS tenant / App ID from https://jaas.8x8.vc */
    JITSI_JAAS_APP_ID: z.string().min(1).optional(),
    /** JaaS API key ID (`kid`) from the developer console. */
    JITSI_JAAS_API_KEY: z.string().min(1).optional(),
    /** PEM private key paired with the JaaS API key (use \\n for newlines in .env). */
    JITSI_JAAS_PRIVATE_KEY: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    const jaasFields = [
      data.JITSI_JAAS_APP_ID,
      data.JITSI_JAAS_API_KEY,
      data.JITSI_JAAS_PRIVATE_KEY,
    ];
    const configured = jaasFields.filter(Boolean).length;
    if (configured > 0 && configured < 3) {
      ctx.addIssue({
        code: "custom",
        message:
          "JITSI_JAAS_APP_ID, JITSI_JAAS_API_KEY, and JITSI_JAAS_PRIVATE_KEY must all be set together for production video.",
      });
    }
  });

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

function parse<T extends z.ZodType>(schema: T, source: Record<string, unknown>): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const flat = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
    const details = Object.entries(flat)
      .map(([k, v]) => `  - ${k}: ${(v ?? []).join(", ")}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${details}`);
  }
  return result.data;
}

const rawServer = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
  NEXT_PUBLIC_JITSI_DOMAIN: process.env.NEXT_PUBLIC_JITSI_DOMAIN,
  JITSI_JAAS_APP_ID: process.env.JITSI_JAAS_APP_ID,
  JITSI_JAAS_API_KEY: process.env.JITSI_JAAS_API_KEY,
  JITSI_JAAS_PRIVATE_KEY: process.env.JITSI_JAAS_PRIVATE_KEY,
};

const rawClient = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

export const serverEnv =
  typeof window === "undefined" ? parse(serverSchema, rawServer) : ({} as z.infer<typeof serverSchema>);

export const clientEnv = parse(clientSchema, rawClient);

export const env = { ...clientEnv, ...serverEnv };
