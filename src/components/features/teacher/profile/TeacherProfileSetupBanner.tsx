"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { MarketingSecondaryCtaLink } from "@/components/ui/Link";
import { useAppShell } from "@/components/layouts/AppShellContext";
import { COLORS } from "@/constants/colors.constants";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { teacherProfileHref } from "./teacherProfileSetup.constants";

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
  if (pathname === "/profile" || user.role !== "TEACHER" || user.teacherProfileCompleted !== false) {
    return null;
  }

  return (
    <Banner role="status">
      <BannerCopy>
        <BannerTitle>Complete your teacher profile</BannerTitle>
        <BannerBody>
          Add your photo, subjects, and schedule on your profile so students can find and book you.
        </BannerBody>
      </BannerCopy>
      <MarketingSecondaryCtaLink href={teacherProfileHref()}>
        Open profile
      </MarketingSecondaryCtaLink>
    </Banner>
  );
}
