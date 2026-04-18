"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { signOutAction } from "./actions";

export interface SignOutButtonProps {
  /** Icon-only control for narrow sidebars (still exposes an accessible name). */
  compact?: boolean;
}

export function SignOutButton({ compact = false }: SignOutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  return (
    <button
      type="button"
      aria-label={compact ? (isPending ? "Signing out" : "Sign out") : undefined}
      onClick={() => {
        startTransition(async () => {
          await signOutAction();
          router.push("/");
          router.refresh();
        });
      }}
      className={
        compact
          ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/90 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-60"
          : "w-full rounded-md px-3 py-1.5 text-left text-sm text-white/90 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-60"
      }
      disabled={isPending}
    >
      {compact ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 18l-6-6 6-6M5 12h14"
            />
          </svg>
      ) : isPending ? (
        "Signing out..."
      ) : (
        "Sign out"
      )}
    </button>
  );
}
