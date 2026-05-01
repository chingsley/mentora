"use client";

import Link from "next/link";
import { Video } from "lucide-react";
import styled from "styled-components";
import { AppHyperLink } from "@/components/ui/Link";
import { DASHBOARD } from "@/constants/dashboard.constants";
import {
  ICON_BOX_TYPE,
  ICON_THEME,
  type IconBoxTypeKey,
} from "@/constants/iconTheme.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherDashboardUpcomingSession } from "@/types/teacherDashboard";
import {
  DashboardCard,
  DashboardCardBody,
  DashboardLink,
  TeacherDashboardCardHeader,
} from "./TeacherDashboardCard";
import { drawBorder } from "@/utils/dev.utils";

/** Preview row count for dashboard card; full list is on /schedule. */
const UPCOMING_SESSIONS_PREVIEW_LIMIT = 3;

const List = styled.ul`
  margin: 0;
  padding: 0 ${SPACING.FOUR} ${SPACING.FOUR};
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Item = styled.li`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  margin-top: ${SPACING.THREE};
  margin-bottom: ${SPACING.THREE};
  // border-bottom: 1px solid ${DASHBOARD.BORDER_SUBTLE};
  // border: ${drawBorder("red", true)};

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const DateBlock = styled.div<{ $variant: IconBoxTypeKey; }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  height: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  border-radius: ${ICON_THEME.METRIC_ICON_BOX_RADIUS};
  flex-shrink: 0;
  background: ${(p) => ICON_BOX_TYPE[p.$variant].background};
  color: ${(p) => ICON_BOX_TYPE[p.$variant].color};
  border: ${(p) => ICON_BOX_TYPE[p.$variant].border};
  box-shadow: ${(p) =>
    p.$variant === "PRIMARY" ? ICON_THEME.METRIC_ICON_BOX_SHADOW : "none"};
`;

const Mo = styled.span`
  font-size: 0.625rem;
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: currentColor;
  letter-spacing: 0.06em;
`;

const Day = styled.span`
  font-size: 1.0625rem;
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: currentColor;
  line-height: 1.1;
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const Subject = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const Sub = styled.p`
  margin: 1px 0 0;
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Time = styled.p`
  margin: ${SPACING.HALF} 0 0;
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
`;

const Cam = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.ACTION_LINK_SIZE};
  height: ${ICON_THEME.ACTION_LINK_SIZE};
  border-radius: ${LAYOUT.RADIUS.MD};
  background: ${ICON_THEME.ACTION_LINK_BACKGROUND};
  border: ${ICON_THEME.ACTION_LINK_BORDER};
  color: ${ICON_THEME.ACTION_LINK_FOREGROUND};
  flex-shrink: 0;

  &:hover {
    background: ${ICON_THEME.ACTION_LINK_BACKGROUND_HOVER};
  }

  &:focus-visible {
    outline: 2px solid ${ICON_THEME.FOCUS_RING_NEUTRAL};
    outline-offset: 2px;
  }
`;

const Empty = styled.p`
  margin: 0;
  padding: 0 ${SPACING.FOUR} ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  color: ${DASHBOARD.TEXT_MUTED};
`;

export interface TeacherUpcomingSessionsCardProps {
  sessions: TeacherDashboardUpcomingSession[];
}

export function TeacherUpcomingSessionsCard({ sessions }: TeacherUpcomingSessionsCardProps) {
  const preview = sessions.slice(0, UPCOMING_SESSIONS_PREVIEW_LIMIT);

  return (
    <DashboardCard $flush>
      <TeacherDashboardCardHeader
        title="Upcoming sessions"
        action={
          <DashboardLink>
            <AppHyperLink href="/schedule">View full schedule →</AppHyperLink>
          </DashboardLink>
        }
      />
      <DashboardCardBody $pad={false}>
        {sessions.length === 0 ? (
          <Empty>No upcoming periods on your calendar.</Empty>
        ) : (
          <List>
            {preview.map((s, index) => (
              <Item key={s.id}>
                <DateBlock $variant={index === 0 ? "PRIMARY" : "SECONDARY"} aria-hidden>
                  <Mo>{s.monthShort}</Mo>
                  <Day>{s.day}</Day>
                </DateBlock>
                <Body>
                  <Subject>{s.subjectName}</Subject>
                  <Time>{s.timeRange}</Time>
                </Body>
                <Cam href="/schedule" aria-label="Open schedule">
                  <Video size={ICON_THEME.ACTION_LINK_LUCIDE_SIZE} strokeWidth={2} />
                </Cam>
              </Item>
            ))}
          </List>
        )}
      </DashboardCardBody>
    </DashboardCard>
  );
}
