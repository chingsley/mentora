"use client";

import Link from "next/link";
import { Video } from "lucide-react";
import styled, { css } from "styled-components";
import { AppHyperLink } from "@/components/ui/Link";
import { COLORS } from "@/constants/colors.constants";
import { DASHBOARD } from "@/constants/dashboard.constants";
import {
  ICON_BOX_TYPE,
  ICON_SIZE,
  ICON_STROKE,
  ICON_THEME,
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

const COMING_UP_LIMIT = 3;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
  padding: 0 0 ${SPACING.FOUR};
`;

const SubsectionLabel = styled.h3`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_MUTED};
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const Subsection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  padding: 0 ${SPACING.FOUR};

  &:first-of-type ${SubsectionLabel} {
    margin-top: ${SPACING.FOUR};
  }
`;

const UpNextPanel = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
  padding: ${SPACING.FOUR};
  border: 1px solid ${COLORS.ACTION_PRIMARY_BORDER_22};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  box-shadow: inset 0 0 0 1px ${COLORS.ACTION_PRIMARY_TINT_06};
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const itemRowStyles = css`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
`;

const Item = styled.li`
  ${itemRowStyles}
  padding: ${SPACING.THREE} 0;

  & + & {
    border-top: 1px solid ${DASHBOARD.BORDER_SUBTLE};
  }
`;

const dateBlockStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  height: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  border-radius: ${ICON_THEME.METRIC_ICON_BOX_RADIUS};
  flex-shrink: 0;
`;

const DateBlock = styled.div`
  ${dateBlockStyles}
  background: ${ICON_BOX_TYPE.SECONDARY.background};
  color: ${ICON_BOX_TYPE.SECONDARY.color};
  border: 1px solid ${ICON_BOX_TYPE.SECONDARY.border};
`;

const FeaturedDateBlock = styled.div`
  ${dateBlockStyles}
  background: ${ICON_BOX_TYPE.PRIMARY.background};
  color: ${ICON_BOX_TYPE.PRIMARY.color};
`;

const Mo = styled.span`
  font-size: ${FONTS.SIZE.MICRO};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: currentColor;
  letter-spacing: 0.06em;
`;

const Day = styled.span`
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: currentColor;
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;

const SessionTitle = styled.p<{ $featured?: boolean }>`
  margin: 0;
  font-size: ${(p) => (p.$featured ? FONTS.SIZE.MD : FONTS.SIZE.SM)};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Time = styled.p`
  margin: ${SPACING.HALF} 0 0;
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const Cam = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.ACTION_LINK_SIZE};
  height: ${ICON_THEME.ACTION_LINK_SIZE};
  border-radius: ${ICON_THEME.ACTION_LINK_RADIUS};
  background: ${ICON_THEME.ACTION_LINK_BACKGROUND};
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

const FeaturedCam = styled(Cam)`
  background: ${COLORS.ACTION_PRIMARY};
  color: ${COLORS.WHITE};

  &:hover {
    background: ${COLORS.ACTION_PRIMARY_HOVER};
  }
`;

const Empty = styled.p`
  margin: 0;
  padding: 0 ${SPACING.FOUR} ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  color: ${DASHBOARD.TEXT_MUTED};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

interface SessionRowProps {
  session: TeacherDashboardUpcomingSession;
  sessionLinkHref: string;
  sessionLinkAriaLabel: string;
  featured?: boolean;
}

function SessionRow({
  session,
  sessionLinkHref,
  sessionLinkAriaLabel,
  featured = false,
}: SessionRowProps) {
  const DateComponent = featured ? FeaturedDateBlock : DateBlock;
  const CamComponent = featured ? FeaturedCam : Cam;

  return (
    <>
      <DateComponent aria-hidden>
        <Mo>{session.monthShort}</Mo>
        <Day>{session.day}</Day>
      </DateComponent>
      <Body>
        <SessionTitle $featured={featured}>{session.subtitle}</SessionTitle>
        <Time>
          {session.subjectName} · {session.timeRange}
        </Time>
      </Body>
      <CamComponent href={sessionLinkHref} aria-label={sessionLinkAriaLabel}>
        <Video size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
      </CamComponent>
    </>
  );
}

export interface TeacherUpcomingSessionsCardProps {
  sessions: TeacherDashboardUpcomingSession[];
  title?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  sessionLinkHref?: string;
  sessionLinkAriaLabel?: string;
  $fillColumn?: boolean;
}

export function TeacherUpcomingSessionsCard({
  sessions,
  title = "Upcoming sessions",
  viewAllHref = "/schedule",
  viewAllLabel = "View full schedule",
  sessionLinkHref = "/schedule",
  sessionLinkAriaLabel = "Open schedule",
  $fillColumn = false,
}: TeacherUpcomingSessionsCardProps) {
  const upNext = sessions[0] ?? null;
  const comingUp = sessions.slice(1, 1 + COMING_UP_LIMIT);

  return (
    <DashboardCard $flush $fillColumn={$fillColumn}>
      <TeacherDashboardCardHeader
        divider
        title={title}
        action={
          <DashboardLink>
            <AppHyperLink href={viewAllHref}>{viewAllLabel}</AppHyperLink>
          </DashboardLink>
        }
      />
      <DashboardCardBody $pad={false}>
        {!upNext ? (
          <Empty>No upcoming periods on your calendar.</Empty>
        ) : (
          <Content>
            <Subsection aria-labelledby="upcoming-sessions-up-next">
              <SubsectionLabel id="upcoming-sessions-up-next">Next</SubsectionLabel>
              <UpNextPanel>
                <SessionRow
                  session={upNext}
                  sessionLinkHref={sessionLinkHref}
                  sessionLinkAriaLabel={sessionLinkAriaLabel}
                  featured
                />
              </UpNextPanel>
            </Subsection>

            {comingUp.length > 0 ? (
              <Subsection aria-labelledby="upcoming-sessions-coming-up">
                <SubsectionLabel id="upcoming-sessions-coming-up">Coming up</SubsectionLabel>
                <List>
                  {comingUp.map((session) => (
                    <Item key={session.id}>
                      <SessionRow
                        session={session}
                        sessionLinkHref={sessionLinkHref}
                        sessionLinkAriaLabel={sessionLinkAriaLabel}
                      />
                    </Item>
                  ))}
                </List>
              </Subsection>
            ) : null}
          </Content>
        )}
      </DashboardCardBody>
    </DashboardCard>
  );
}
