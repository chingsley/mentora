"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useNavigationLoading } from "@/components/layouts/NavigationLoadingProvider";

/**
 * App Router with immediate global loading overlay on programmatic navigations.
 */
export function useAppRouter(): ReturnType<typeof useRouter> {
  const router = useRouter();
  const { beginNavigation } = useNavigationLoading();

  return React.useMemo(
    () => ({
      back: router.back,
      forward: router.forward,
      prefetch: router.prefetch,
      push: (href: string, options?: Parameters<ReturnType<typeof useRouter>["push"]>[1]) => {
        beginNavigation();
        return router.push(href, options);
      },
      replace: router.replace,
      refresh: router.refresh,
    }),
    [beginNavigation, router],
  );
}
