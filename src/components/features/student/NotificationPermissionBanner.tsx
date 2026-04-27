"use client";

import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Banner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  border-radius: ${LAYOUT.RADIUS.XL};
  border: 1px solid #fcd34d;
  background-color: #fffbeb;
  padding: ${SPACING.FOUR};
  color: #78350f;

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const BannerTitle = styled.p`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
`;

const BannerBody = styled.p`
  font-size: ${FONTS.SIZE.XS};
  opacity: 0.9;
`;

const BannerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
`;

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
    <Banner>
      <div>
        <BannerTitle>Get class reminders</BannerTitle>
        <BannerBody>
          We&apos;ll nudge you 10 minutes before each class starts and again
          when it goes live. Notifications only fire while Mentora is open in
          your browser.
        </BannerBody>
      </div>
      <BannerActions>
        <Button type="button" size="sm" onClick={handleEnable}>
          Enable notifications
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={handleDismiss}>
          Not now
        </Button>
      </BannerActions>
    </Banner>
  );
}
