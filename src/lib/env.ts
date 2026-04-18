import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  AUTH_URL: z.string().url().optional(),
  EMAIL_FROM: z.string().email().default("no-reply@mentora.local"),
  SEED_ADMIN_EMAIL: z.string().email().default("admin@mentora.local"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
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
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
};

const rawClient = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

export const serverEnv =
  typeof window === "undefined" ? parse(serverSchema, rawServer) : ({} as z.infer<typeof serverSchema>);

export const clientEnv = parse(clientSchema, rawClient);

export const env = { ...clientEnv, ...serverEnv };
