"use client";

import { Calendar, ClipboardList, Users, Wallet } from "lucide-react";
import styled from "styled-components";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherDashboardPayload } from "@/types/teacherDashboard";
import { TeacherDashboardCharts } from "./TeacherDashboardCharts";
import { TeacherStatCard } from "./TeacherStatCard";
import { TeacherUpcomingSessionsCard } from "./TeacherUpcomingSessionsCard";

const Root = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StatGrid = styled.div`
  margin-top: 0;
  display: grid;
  gap: ${SPACING.FIVE};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const InsightsRow = styled.div`
  display: grid;
  gap: ${SPACING.FIVE};
  margin-top: ${SPACING.TWELVE};
  grid-template-columns: 1fr;
  align-items: stretch;

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  }
`;

const STAT_ICONS = [ClipboardList, Users, Calendar, Wallet] as const;

export interface TeacherDashboardViewProps {
  data: TeacherDashboardPayload;
}

export function TeacherDashboardView({ data }: TeacherDashboardViewProps) {
  return (
    <Root>
      <StatGrid>
        {data.stats.map((stat, index) => (
          <TeacherStatCard
            key={stat.label}
            stat={stat}
            icon={STAT_ICONS[index] ?? ClipboardList}
          />
        ))}
      </StatGrid>

      <InsightsRow>
        <TeacherDashboardCharts charts={data.charts} />
        <TeacherUpcomingSessionsCard sessions={data.upcomingSessions} $fillColumn />
      </InsightsRow>
    </Root>
  );
}
