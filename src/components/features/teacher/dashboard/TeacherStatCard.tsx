"use client";

import type { LucideIcon } from "lucide-react";
import styled from "styled-components";
import { AppHyperLink } from "@/components/ui/Link";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import {
  ICON_BOX_TYPE,
  ICON_THEME,
  type IconBoxTypeKey,
} from "@/constants/iconTheme.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherDashboardStat } from "@/types/teacherDashboard";
import { DashboardCard } from "./TeacherDashboardCard";

const Shell = styled(DashboardCard)`
  padding: ${SPACING.FIVE};
`;

const Top = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${SPACING.THREE};
`;

const IconTile = styled.div<{ $variant: IconBoxTypeKey; }>`
  display: flex;
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

const Label = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${DASHBOARD.TEXT_PRIMARY};
`;

const Value = styled.p`
  margin: ${SPACING.TWO} 0 0;
  font-size: 1.75rem;
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
  letter-spacing: -0.03em;
  line-height: 1.1;
`;

const Hint = styled.p`
  margin: ${SPACING.ONE} 0 0;
  font-size: ${DASHBOARD.SECONDARY_TEXT.FONT_SIZE};
  color: ${DASHBOARD.SECONDARY_TEXT.COLOR};
`;

const Trend = styled.p<{ $positive?: boolean; }>`
  margin: ${SPACING.TWO} 0 0;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${(p) => (p.$positive === false ? DASHBOARD.TEXT_SECONDARY : DASHBOARD.SUCCESS)};
`;

const Footer = styled.div`
  margin-top: ${SPACING.THREE};
`;

export interface TeacherStatCardProps {
  stat: TeacherDashboardStat;
  icon: LucideIcon;
  iconBoxType: IconBoxTypeKey;
}

export function TeacherStatCard({ stat, icon: Icon, iconBoxType }: TeacherStatCardProps) {
  return (
    <Shell>
      <Top>
        <div>
          <Label>{stat.label}</Label>
          <Value>{stat.value}</Value>
          <Hint>{stat.hint}</Hint>
          {stat.trend ? <Trend $positive={stat.trendPositive}>{stat.trend}</Trend> : null}
          {stat.footerLink ? (
            <Footer>
              <AppHyperLink href={stat.footerLink.href}>{stat.footerLink.label}</AppHyperLink>
            </Footer>
          ) : null}
        </div>
        <IconTile $variant={iconBoxType} aria-hidden>
          <Icon size={ICON_THEME.METRIC_LUCIDE_SIZE} strokeWidth={2} />
        </IconTile>
      </Top>
    </Shell>
  );
}
