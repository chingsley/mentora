"use client";

import * as React from "react";
import styled from "styled-components";
import { LineChart } from "@/components/ui/LineChart";
import { CHART } from "@/constants/chart.constants";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { LineChartYAxisMode } from "@/lib/lineChartScale";
import type { TeacherDashboardCharts as TeacherDashboardChartsData } from "@/types/teacherDashboard";
import {
  DashboardCard,
  DashboardCardBody,
} from "./TeacherDashboardCard";

const CardInner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  margin-bottom: ${SPACING.FIVE};

  ${LAYOUT.MEDIA.MD} {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${SPACING.SIX};
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${DASHBOARD.TEXT_PRIMARY};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
`;

const Subtitle = styled.p`
  margin: ${SPACING.ONE} 0 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${CHART.SUBTITLE};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
`;

const ToggleList = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: ${SPACING.ONE};
  padding: ${SPACING.HALF};
  border-radius: ${CHART.TOGGLE_RADIUS};
  border: 1px solid ${CHART.TOGGLE_BORDER};
  background: ${CHART.TOGGLE_BG};
  width: fit-content;
  max-width: 100%;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${(p) => (p.$active ? CHART.TOGGLE_ACTIVE_BG : CHART.TOGGLE_BORDER)};
  border-radius: calc(${CHART.TOGGLE_RADIUS} - ${SPACING.HALF});
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${(p) => (p.$active ? FONTS.WEIGHT.SEMIBOLD : FONTS.WEIGHT.MEDIUM)};
  color: ${(p) => (p.$active ? CHART.TOGGLE_ACTIVE_TEXT : CHART.TOGGLE_INACTIVE_TEXT)};
  background: ${(p) => (p.$active ? CHART.TOGGLE_ACTIVE_BG : CHART.TOGGLE_INACTIVE_BG)};
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    color: ${(p) => (p.$active ? CHART.TOGGLE_ACTIVE_TEXT : CHART.HEADLINE)};
  }

  &:focus-visible {
    outline: 2px solid ${CHART.LINE_STROKE};
    outline-offset: 2px;
  }
`;

const HeadlineRow = styled.p`
  margin: 0 0 ${SPACING.FIVE};
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: ${SPACING.TWO};
`;

const HeadlineValue = styled.span`
  font-size: ${FONTS.SIZE.STAT_VALUE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${CHART.HEADLINE};
  letter-spacing: -0.03em;
  line-height: 1;
`;

const HeadlineContext = styled.span`
  font-size: ${FONTS.SIZE.SM};
  color: ${CHART.SUBTITLE};
`;

const FooterNote = styled.p`
  margin: ${SPACING.FOUR} 0 0;
  font-size: ${FONTS.SIZE.MICRO};
  color: ${CHART.FOOTER};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
`;

type ChartViewId = "classes" | "attendance";

interface ChartViewConfig {
  id: ChartViewId;
  toggleLabel: string;
  subtitle: string;
  ariaLabel: string;
  emptyMessage: string;
  footer: string;
  yAxisMode: LineChartYAxisMode;
  valueSuffix?: string;
  headline: (charts: TeacherDashboardChartsData) => { value: string; context: string };
  points: (charts: TeacherDashboardChartsData) => TeacherDashboardChartsData["classesHeldThisMonth"]["points"];
}

const CHART_VIEWS: ChartViewConfig[] = [
  {
    id: "classes",
    toggleLabel: "Classes held",
    subtitle: "Completed class sessions each week this month.",
    ariaLabel: "Classes held by week in the current month",
    emptyMessage: "No classes held this month yet.",
    footer: "Rolling month view · weeks start Monday · class = one held session.",
    yAxisMode: "count",
    valueSuffix: " classes",
    headline: (charts) => ({
      value: String(charts.classesHeldThisMonth.total),
      context: `completed classes in ${charts.classesHeldThisMonth.monthLabel}`,
    }),
    points: (charts) => charts.classesHeldThisMonth.points,
  },
  {
    id: "attendance",
    toggleLabel: "Student attendance",
    subtitle: "Share of marked student-sessions attended.",
    ariaLabel: "Student attendance rate by week for the past eight weeks",
    emptyMessage: "No attendance marked in the past 8 weeks.",
    footer:
      "Rolling 8 weeks · weeks start Monday · rate = (present + late) ÷ marked sessions.",
    yAxisMode: "percent",
    headline: (charts) => ({
      value: charts.studentAttendancePast8Weeks.averageFormatted,
      context: "average attendance over the past 8 weeks",
    }),
    points: (charts) => charts.studentAttendancePast8Weeks.points,
  },
];

export interface TeacherDashboardChartsProps {
  charts: TeacherDashboardChartsData;
}

export function TeacherDashboardCharts({ charts }: TeacherDashboardChartsProps) {
  const [activeView, setActiveView] = React.useState<ChartViewId>("classes");
  const view = CHART_VIEWS.find((item) => item.id === activeView) ?? CHART_VIEWS[0]!;
  const headline = view.headline(charts);

  return (
    <DashboardCard $fillColumn>
      <DashboardCardBody $fill>
        <CardInner>
          <HeaderRow>
            <TitleBlock>
              <Title>Weekly trends</Title>
              <Subtitle>{view.subtitle}</Subtitle>
            </TitleBlock>
            <ToggleList role="tablist" aria-label="Weekly trend views">
              {CHART_VIEWS.map((item) => (
                <ToggleButton
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={activeView === item.id}
                  $active={activeView === item.id}
                  onClick={() => setActiveView(item.id)}
                >
                  {item.toggleLabel}
                </ToggleButton>
              ))}
            </ToggleList>
          </HeaderRow>

          <HeadlineRow role="tabpanel" aria-label={view.toggleLabel}>
            <HeadlineValue>{headline.value}</HeadlineValue>
            <HeadlineContext>{headline.context}</HeadlineContext>
          </HeadlineRow>

          <LineChart
            ariaLabel={view.ariaLabel}
            points={view.points(charts)}
            emptyMessage={view.emptyMessage}
            valueSuffix={view.valueSuffix}
            yAxisMode={view.yAxisMode}
          />

          <FooterNote>{view.footer}</FooterNote>
        </CardInner>
      </DashboardCardBody>
    </DashboardCard>
  );
}
