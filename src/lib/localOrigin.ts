/**
 * Canonical public HTTP origin for the app (browser, Auth.js, emails, absolute links).
 *
 * **One rule:** `NEXT_PUBLIC_APP_URL` if set, otherwise `http://localhost:${PORT}`.
 * `next.config.ts` assigns both `NEXT_PUBLIC_APP_URL` and `AUTH_URL` to this value so
 * you never configure two URLs for the same thing.
 */

export function readPortFromEnv(portEnv: string | undefined): number {
  if (portEnv === undefined || portEnv === "") return 3000;
  const n = Number(portEnv);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 65535) return 3000;
  return n;
}

export function defaultLocalAppOrigin(): string {
  return `http://localhost:${readPortFromEnv(process.env.PORT)}`;
}

/**
 * Same origin everywhere: set `NEXT_PUBLIC_APP_URL` when the site is not served at
 * localhost (e.g. production). Omit it locally and only tune `PORT` if needed.
 */
export function resolveCanonicalSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? defaultLocalAppOrigin();
}
