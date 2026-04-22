"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

const DISMISS_KEY = "notif:dismissed";

function computeBannerState(): "prompt" | "hidden" {
  if (typeof window === "undefined") return "hidden";
  if (!("Notification" in window)) return "hidden";
  if (window.Notification.permission !== "default") return "hidden";
  try {
    if (window.localStorage.getItem(DISMISS_KEY)) return "hidden";
  } catch {
    /* no localStorage */
  }
  return "prompt";
}

export function NotificationPermissionBanner() {
  const [state, setState] = React.useState<
    "loading" | "prompt" | "hidden"
  >("loading");

  React.useEffect(() => {
    const next = computeBannerState();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- runtime capability + localStorage check must run after mount
    setState(next);
  }, []);

  async function handleEnable() {
    try {
      const permission = await window.Notification.requestPermission();
      if (permission !== "default") setState("hidden");
    } catch {
      setState("hidden");
    }
  }

  function handleDismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setState("hidden");
  }

  if (state !== "prompt") return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold">Get class reminders</p>
        <p className="text-xs opacity-90">
          We&apos;ll nudge you 10 minutes before each class starts and again
          when it goes live. Notifications only fire while Mentora is open in
          your browser.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={handleEnable}>
          Enable notifications
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={handleDismiss}>
          Not now
        </Button>
      </div>
    </div>
  );
}
