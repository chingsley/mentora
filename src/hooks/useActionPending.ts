"use client";

import * as React from "react";

type TransitionFunction = () => void | Promise<void>;

export type StartActionTransition = (callback: TransitionFunction) => void;

/**
 * Pending flag for in-flight actions (disable controls, local state). Prefer over
 * `useTransition` for button loading UI. Pair with `useNavigationLoading` for
 * submit → redirect flows.
 */
export function useActionPending(): [boolean, StartActionTransition] {
  const [isPending, setIsPending] = React.useState(false);

  const startTransition = React.useCallback((callback: TransitionFunction) => {
    setIsPending(true);
    try {
      const result = callback();
      if (isPromiseLike(result)) {
        void result.finally(() => {
          setIsPending(false);
        });
      } else {
        setIsPending(false);
      }
    } catch (error) {
      setIsPending(false);
      throw error;
    }
  }, []);

  return [isPending, startTransition];
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    "then" in value &&
    typeof (value as Promise<unknown>).then === "function"
  );
}
