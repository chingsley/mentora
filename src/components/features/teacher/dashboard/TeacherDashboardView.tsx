"use client";

import { Calendar, ClipboardList, Users, Wallet } from "lucide-react";
import styled from "styled-components";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherDashboardPayload } from "@/types/teacherDashboard";
import { TeacherClassesTableCard } from "./TeacherClassesTableCard";
import { TeacherDashboardHeader } from "./TeacherDashboardHeader";
import { TeacherRecentMessagesCard } from "./TeacherRecentMessagesCard";
import type { IconBoxTypeKey } from "@/constants/iconTheme.constants";
import { TeacherStatCard } from "./TeacherStatCard";
import { TeacherUpcomingSessionsCard } from "./TeacherUpcomingSessionsCard";
import { drawBorder } from "@/utils/dev.utils";

const Root = styled.div`
  width: 100%;
  margin: calc(-1 * ${SPACING.SIX}) calc(-1 * ${SPACING.FOUR});
  padding: ${SPACING.SIX} ${SPACING.FOUR};
  // border: ${drawBorder("red", true)};

  ${LAYOUT.MEDIA.SM} {
    margin: calc(-1 * ${SPACING.TEN}) calc(-1 * ${SPACING.SIX});
    padding: ${SPACING.SIX} ${SPACING.SIX};
  }
`;

const StatGrid = styled.div`
  margin-top: ${SPACING.TWELVE};
  display: grid;
  gap: ${SPACING.FOUR};
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
  gap: ${SPACING.FIVE};
  grid-template-columns: 1fr;
  margin-top: ${SPACING.TEN};

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

const STAT_ICONS = [ClipboardList, Users, Wallet, Calendar] as const;

export interface TeacherDashboardViewProps {
  data: TeacherDashboardPayload;
}

export function TeacherDashboardView({ data }: TeacherDashboardViewProps) {
  return (
    <Root>
      <TeacherDashboardHeader teacherName={data.teacherName} teacherImage={data.teacherImage} />

      <StatGrid>
        {data.stats.map((stat, index) => {
          const iconBoxType: IconBoxTypeKey = index % 2 === 0 ? "PRIMARY" : "SECONDARY";
          return (
            <TeacherStatCard
              key={stat.label}
              stat={stat}
              icon={STAT_ICONS[index] ?? ClipboardList}
              iconBoxType={iconBoxType}
            />
          );
        })}
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
