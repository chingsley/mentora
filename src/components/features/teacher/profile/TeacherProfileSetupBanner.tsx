"use client";

import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { MarketingSecondaryCtaLink } from "@/components/ui/Link";
import { useAppShell } from "@/components/layouts/AppShellContext";
import { COLORS } from "@/constants/colors.constants";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import {
  TEACHER_SETUP_QUERY_VALUE,
  TEACHER_WELCOME_QUERY_VALUE,
  teacherProfileSetupHref,
} from "./teacherProfileSetup.constants";

const Banner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  margin-bottom: ${SPACING.FIVE};
  border-radius: ${LAYOUT.RADIUS.SM};
  border: 1px solid ${DASHBOARD.BORDER_SUBTLE};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  padding: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const BannerCopy = styled.div`
  min-width: 0;
`;

const BannerTitle = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const BannerBody = styled.p`
  margin: ${SPACING.ONE} 0 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${DASHBOARD.TEXT_SECONDARY};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
`;

export function TeacherProfileSetupBanner() {
  const user = useAppShell();
  const pathname = usePathname();
  const params = useSearchParams();
  const setupOpen =
    pathname === "/profile" && params.get("setup") === TEACHER_SETUP_QUERY_VALUE;
  const welcomeOpen =
    pathname === "/profile" && params.get("welcome") === TEACHER_WELCOME_QUERY_VALUE;

  if (user.role !== "TEACHER" || user.teacherProfileCompleted !== false || setupOpen || welcomeOpen) {
    return null;
  }

  return (
    <Banner role="status">
      <BannerCopy>
        <BannerTitle>Finish setting up your teacher profile</BannerTitle>
        <BannerBody>
          Add your photo, courses, schedule, and payout details so students can discover and book you.
        </BannerBody>
      </BannerCopy>
      <MarketingSecondaryCtaLink href={teacherProfileSetupHref()}>
        Complete setup
      </MarketingSecondaryCtaLink>
    </Banner>
  );
}
