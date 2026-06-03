"use client";

import { BookOpen, Calendar, ClipboardList, GraduationCap } from "lucide-react";
import styled from "styled-components";
import { NotificationPermissionBanner } from "@/components/features/student/NotificationPermissionBanner";
import { TeacherDashboardHeader } from "@/components/features/teacher/dashboard/TeacherDashboardHeader";
import { TeacherStatCard } from "@/components/features/teacher/dashboard/TeacherStatCard";
import { TeacherUpcomingSessionsCard } from "@/components/features/teacher/dashboard/TeacherUpcomingSessionsCard";
import type { IconBoxTypeKey } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { StudentDashboardPayload } from "@/types/studentDashboard";
import { StudentAssignmentsDueCard } from "./StudentAssignmentsDueCard";
import { StudentClassesTableCard } from "./StudentClassesTableCard";

const Root = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const BannerWrap = styled.div`
  margin-bottom: ${SPACING.FOUR};
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

const STAT_ICONS = [BookOpen, GraduationCap, ClipboardList, Calendar] as const;

export interface StudentDashboardViewProps {
  data: StudentDashboardPayload;
}

export function StudentDashboardView({ data }: StudentDashboardViewProps) {
  const subtitle =
    data.classes.length > 0
      ? `You have ${data.classes.length} active class${data.classes.length === 1 ? "" : "es"} on your roster.`
      : "Browse teachers to enroll in your first class.";

  return (
    <Root>
      <BannerWrap>
        <NotificationPermissionBanner />
      </BannerWrap>

      <TeacherDashboardHeader
        teacherName={data.studentName}
        teacherImage={data.studentImage}
        title="Student Dashboard"
        subtitle={subtitle}
        searchPlaceholder="Search classes, teachers, assignments…"
        profileRole="Student"
      />

      <StatGrid>
        {data.stats.map((stat, index) => {
          const iconBoxType: IconBoxTypeKey = index % 2 === 0 ? "PRIMARY" : "SECONDARY";
          return (
            <TeacherStatCard
              key={stat.label}
              stat={stat}
              icon={STAT_ICONS[index] ?? BookOpen}
              iconBoxType={iconBoxType}
            />
          );
        })}
      </StatGrid>

      <MidGrid>
        <MidColumn>
          <StudentClassesTableCard rows={data.classes} />
        </MidColumn>
        <MidColumn>
          <TeacherUpcomingSessionsCard
            sessions={data.upcomingSessions}
            viewAllHref="/classes"
            viewAllLabel="View my classes →"
            sessionLinkHref="/classes"
            sessionLinkAriaLabel="Open my classes"
          />
          <StudentAssignmentsDueCard items={data.assignments} />
        </MidColumn>
      </MidGrid>
    </Root>
  );
}
