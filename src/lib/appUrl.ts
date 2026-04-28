import "server-only";

import { resolveCanonicalSiteUrl } from "@/lib/localOrigin";

/** Same origin as `NEXT_PUBLIC_APP_URL` / Auth.js (see `resolveCanonicalSiteUrl`). */
export function getAppUrl(): string {
  return resolveCanonicalSiteUrl();
}
