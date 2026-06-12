"use client";

import styled from "styled-components";
import { CHART } from "@/constants/chart.constants";
import { FONTS } from "@/constants/fonts.constants";
import {
  buildSmoothAreaPath,
  buildSmoothLinePath,
  chartYAxisTicks,
  niceChartMax,
  type LineChartYAxisMode,
} from "@/lib/lineChartScale";
import { SPACING } from "@/constants/spacing.constants";

export interface LineChartPoint {
  label: string;
  axisLabel?: string;
  value: number;
  valueFormatted?: string;
}

export interface LineChartProps {
  points: LineChartPoint[];
  ariaLabel: string;
  emptyMessage?: string;
  valueSuffix?: string;
  yAxisMode?: LineChartYAxisMode;
  formatYAxisTick?: (value: number) => string;
}

const Root = styled.figure`
  margin: 0;
  width: 100%;
`;

const PlotRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${SPACING.TWO};
  width: 100%;
  height: ${CHART.HEIGHT};
`;

const YAxis = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  width: 2.75rem;
  padding: ${SPACING.ONE} 0 ${CHART.X_AXIS_HEIGHT};
`;

const YTick = styled.span`
  font-size: ${CHART.LABEL_FONT_SIZE};
  line-height: 1;
  color: ${CHART.LABEL};
  text-align: right;
`;

const SvgWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  height: 100%;
`;

const DotsLayer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const plotDotCss = `
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
`;

const DotHalo = styled.span`
  ${plotDotCss}
  width: ${CHART.POINT_HALO_SIZE};
  height: ${CHART.POINT_HALO_SIZE};
  background-color: ${CHART.LINE_POINT_HALO};
`;

const DotCore = styled.span`
  ${plotDotCss}
  width: ${CHART.POINT_SIZE};
  height: ${CHART.POINT_SIZE};
  background-color: ${CHART.LINE_POINT};
`;

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
`;

const AxisLabels = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$columns}, minmax(0, 1fr));
  gap: ${SPACING.ONE};
  margin-top: ${SPACING.TWO};
  padding-left: calc(2.75rem + ${SPACING.TWO});
`;

const AxisLabel = styled.span`
  display: block;
  text-align: center;
  font-size: ${CHART.LABEL_FONT_SIZE};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${CHART.LABEL};
`;

const Empty = styled.p`
  margin: 0;
  padding: ${SPACING.SIX} 0;
  text-align: center;
  font-size: ${CHART.SUMMARY_FONT_SIZE};
  color: ${CHART.EMPTY};
`;

const SrTable = styled.table`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const PLOT = {
  TOP: 6,
  BOTTOM: 8,
  LEFT: 0,
  RIGHT: 2,
} as const;

function xPosition(index: number, count: number): number {
  const left = PLOT.LEFT;
  const right = 100 - PLOT.RIGHT;
  if (count <= 1) return (left + right) / 2;
  return left + (index / (count - 1)) * (right - left);
}

function yPosition(value: number, maxValue: number): number {
  const plotHeight = 100 - PLOT.TOP - PLOT.BOTTOM;
  const ratio = maxValue > 0 ? value / maxValue : 0;
  return PLOT.TOP + plotHeight * (1 - ratio);
}

export function LineChart({
  points,
  ariaLabel,
  emptyMessage = "No data for this period yet.",
  valueSuffix = "",
  yAxisMode = "count",
  formatYAxisTick,
}: LineChartProps) {
  const hasData = points.some((p) => p.value > 0);
  const rawMax = Math.max(...points.map((p) => p.value), 0);
  const maxValue = niceChartMax(rawMax, yAxisMode);
  const yTicks = chartYAxisTicks(maxValue, yAxisMode).reverse();
  const formatTick =
    formatYAxisTick ??
    ((value: number) => (yAxisMode === "percent" ? `${value}%` : String(value)));

  const srTable = (
    <SrTable>
      <caption>{ariaLabel}</caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          <th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>
        {points.map((point) => (
          <tr key={point.label}>
            <td>{point.label}</td>
            <td>{point.valueFormatted ?? `${point.value}${valueSuffix}`}</td>
          </tr>
        ))}
      </tbody>
    </SrTable>
  );

  if (!hasData) {
    return (
      <Root>
        <Empty>{emptyMessage}</Empty>
        {srTable}
      </Root>
    );
  }

  const coords = points.map((point, index) => ({
    x: xPosition(index, points.length),
    y: yPosition(point.value, maxValue),
  }));
  const baseline = 100 - PLOT.BOTTOM;
  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const plotHeight = 100 - PLOT.TOP - PLOT.BOTTOM;
    return PLOT.TOP + plotHeight * ratio;
  });

  return (
    <Root>
      <PlotRow>
        <YAxis aria-hidden>
          {yTicks.map((tick) => (
            <YTick key={tick}>{formatTick(tick)}</YTick>
          ))}
        </YAxis>
        <SvgWrap>
          <Svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
            {gridYs.map((y) => (
              <line
                key={y}
                x1={PLOT.LEFT}
                y1={y}
                x2={100 - PLOT.RIGHT}
                y2={y}
                stroke={CHART.GRID}
                strokeWidth="0.4"
                strokeDasharray="1.5 2.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={buildSmoothAreaPath(coords, baseline)} fill={CHART.LINE_FILL} />
            <path
              d={buildSmoothLinePath(coords)}
              fill="none"
              stroke={CHART.LINE_STROKE}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
          </Svg>
          <DotsLayer aria-hidden>
            {coords.map((coord, index) => (
              <DotHalo
                key={points[index]?.label ?? index}
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              />
            ))}
            {coords.map((coord, index) => (
              <DotCore
                key={`${points[index]?.label ?? index}-dot`}
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              />
            ))}
          </DotsLayer>
        </SvgWrap>
      </PlotRow>
      <AxisLabels $columns={points.length} aria-hidden>
        {points.map((point) => (
          <AxisLabel key={point.label} title={point.label}>
            {point.axisLabel ?? point.label}
          </AxisLabel>
        ))}
      </AxisLabels>
      {srTable}
    </Root>
  );
}
