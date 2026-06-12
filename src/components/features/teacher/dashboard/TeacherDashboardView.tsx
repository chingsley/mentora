"use client";

import { Calendar, ClipboardList, Users, Wallet } from "lucide-react";
import styled from "styled-components";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherDashboardPayload } from "@/types/teacherDashboard";
import { TeacherClassesTableCard } from "./TeacherClassesTableCard";
import { TeacherRecentMessagesCard } from "./TeacherRecentMessagesCard";
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

const MidGrid = styled.div`
  display: grid;
  gap: ${SPACING.SIX};
  grid-template-columns: 1fr;
  margin-top: ${SPACING.TWELVE};

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: minmax(0, 2fr) minmax(17rem, 1fr);
    align-items: stretch;
  }
`;

const MidColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
  min-height: 0;

  ${LAYOUT.MEDIA.LG} {
    > *:only-child {
      flex: 1;
      min-height: 0;
    }
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

      <MidGrid>
        <MidColumn>
          <TeacherClassesTableCard rows={data.classes} />
        </MidColumn>
        <MidColumn>
          <TeacherUpcomingSessionsCard sessions={data.upcomingSessions} />
          <TeacherRecentMessagesCard items={data.messages} />
        </MidColumn>
      </MidGrid>

    </Root>
  );
}
