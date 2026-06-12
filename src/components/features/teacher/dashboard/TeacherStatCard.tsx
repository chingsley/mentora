"use client";

import type { LucideIcon } from "lucide-react";
import styled, { css } from "styled-components";
import { AppHyperLink } from "@/components/ui/Link";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import {
  ICON_SIZE,
  ICON_STROKE,
  ICON_THEME,
} from "@/constants/iconTheme.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherDashboardStat } from "@/types/teacherDashboard";
import { DashboardCard } from "./TeacherDashboardCard";

const accentShellStyles = css`
  background-color: ${DASHBOARD.STAT_ACCENT.BACKGROUND};
  border-color: ${DASHBOARD.STAT_ACCENT.BORDER};
  box-shadow: ${DASHBOARD.STAT_ACCENT.SHADOW};
  color: ${DASHBOARD.STAT_ACCENT.TEXT};
`;

const Shell = styled(DashboardCard)<{ $accent?: boolean }>`
  padding: ${SPACING.FIVE};
  ${(p) => (p.$accent ? accentShellStyles : "")}
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${SPACING.THREE};
`;

const IconTile = styled.div<{ $accent?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  height: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  border-radius: ${ICON_THEME.METRIC_ICON_BOX_RADIUS};
  flex-shrink: 0;
  background: ${(p) =>
    p.$accent ? DASHBOARD.STAT_ACCENT.ICON_TILE_BACKGROUND : DASHBOARD.ICON_TILE_BACKGROUND};
  color: ${(p) =>
    p.$accent ? DASHBOARD.STAT_ACCENT.ICON_TILE_COLOR : DASHBOARD.ICON_TILE_COLOR};
`;

const Label = styled.p<{ $accent?: boolean }>`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${(p) => (p.$accent ? DASHBOARD.STAT_ACCENT.TEXT : DASHBOARD.TEXT_PRIMARY)};
`;

const Value = styled.p<{ $accent?: boolean }>`
  margin: ${SPACING.TWO} 0 0;
  font-size: ${FONTS.SIZE.STAT_VALUE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${(p) => (p.$accent ? DASHBOARD.STAT_ACCENT.TEXT : DASHBOARD.TEXT_PRIMARY)};
  letter-spacing: -0.03em;
  line-height: 1.1;
`;

const Hint = styled.p<{ $accent?: boolean }>`
  margin: ${SPACING.ONE} 0 0;
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${(p) =>
    p.$accent ? DASHBOARD.STAT_ACCENT.TEXT_SECONDARY : DASHBOARD.SECONDARY_TEXT.COLOR};
`;

const Trend = styled.p<{ $positive?: boolean; $accent?: boolean }>`
  margin: ${SPACING.TWO} 0 0;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${(p) => {
    if (p.$accent) {
      return p.$positive === false
        ? DASHBOARD.STAT_ACCENT.TREND_NEUTRAL
        : DASHBOARD.STAT_ACCENT.TREND_POSITIVE;
    }
    return p.$positive === false ? DASHBOARD.TEXT_SECONDARY : DASHBOARD.SUCCESS;
  }};
`;

const Footer = styled.div`
  margin-top: ${SPACING.THREE};
`;

const AccentFooterLink = styled(AppHyperLink)`
  color: ${DASHBOARD.STAT_ACCENT.LINK_COLOR};
  text-decoration-color: ${DASHBOARD.STAT_ACCENT.LINK_HOVER};

  &:hover {
    color: ${DASHBOARD.STAT_ACCENT.LINK_HOVER};
    text-decoration-color: ${DASHBOARD.STAT_ACCENT.TEXT};
  }

  &:focus-visible {
    outline-color: ${DASHBOARD.STAT_ACCENT.TEXT};
  }
`;

export interface TeacherStatCardProps {
  stat: TeacherDashboardStat;
  icon: LucideIcon;
}

export function TeacherStatCard({ stat, icon: Icon }: TeacherStatCardProps) {
  const accent = stat.accent === true;

  return (
    <Shell $accent={accent}>
      <Top>
        <div>
          <Label $accent={accent}>{stat.label}</Label>
          <Value $accent={accent}>{stat.value}</Value>
          {stat.hint ? <Hint $accent={accent}>{stat.hint}</Hint> : null}
          {stat.trend ? (
            <Trend $positive={stat.trendPositive} $accent={accent}>
              {stat.trend}
            </Trend>
          ) : null}
          {stat.footerLink ? (
            <Footer>
              {accent ? (
                <AccentFooterLink href={stat.footerLink.href}>
                  {stat.footerLink.label}
                </AccentFooterLink>
              ) : (
                <AppHyperLink href={stat.footerLink.href}>{stat.footerLink.label}</AppHyperLink>
              )}
            </Footer>
          ) : null}
        </div>
        <IconTile $accent={accent} aria-hidden>
          <Icon size={ICON_SIZE.LG} strokeWidth={ICON_STROKE.MEDIUM} />
        </IconTile>
      </Top>
    </Shell>
  );
}
