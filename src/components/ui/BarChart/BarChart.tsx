"use client";

import styled from "styled-components";
import { CHART } from "@/constants/chart.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface BarChartPoint {
  label: string;
  value: number;
  valueFormatted?: string;
}

export type BarChartVariant = "default" | "projected";

export interface BarChartProps {
  points: BarChartPoint[];
  ariaLabel: string;
  emptyMessage?: string;
  valueSuffix?: string;
  variant?: BarChartVariant;
}

const Root = styled.figure`
  margin: 0;
  width: 100%;
`;

const Plot = styled.div`
  width: 100%;
  height: ${CHART.HEIGHT};
`;

const Svg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
`;

const AxisLabels = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$columns}, minmax(0, 1fr));
  gap: ${SPACING.ONE};
  margin-top: ${SPACING.TWO};
`;

const AxisLabel = styled.span`
  display: block;
  text-align: center;
  font-size: ${CHART.LABEL_FONT_SIZE};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${CHART.LABEL};
  overflow: hidden;
  text-overflow: ellipsis;
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

function barFill(variant: BarChartVariant, value: number): string {
  if (value <= 0) return CHART.BAR_FILL_MUTED;
  return variant === "projected" ? CHART.BAR_FILL_PROJECTED : CHART.BAR_FILL;
}

export function BarChart({
  points,
  ariaLabel,
  emptyMessage = "No data for this period yet.",
  valueSuffix = "",
  variant = "default",
}: BarChartProps) {
  const hasData = points.some((p) => p.value > 0);
  const maxValue = Math.max(1, ...points.map((p) => p.value));

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

  const plotTop = 8;
  const plotBottom = 10;
  const plotHeight = 100 - plotTop - plotBottom;
  const barGap = 8;
  const barWidth = (100 - barGap * (points.length + 1)) / points.length;

  return (
    <Root>
      <Plot>
        <Svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
          <line
            x1="0"
            y1={100 - plotBottom}
            x2="100"
            y2={100 - plotBottom}
            stroke={CHART.AXIS}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((point, index) => {
            const height = (point.value / maxValue) * plotHeight;
            const x = barGap + index * (barWidth + barGap);
            const y = plotTop + (plotHeight - height);
            return (
              <rect
                key={point.label}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(height, 0.8)}
                rx="1.2"
                fill={barFill(variant, point.value)}
              />
            );
          })}
        </Svg>
      </Plot>
      <AxisLabels $columns={points.length} aria-hidden>
        {points.map((point) => (
          <AxisLabel key={point.label} title={point.label}>
            {point.label}
          </AxisLabel>
        ))}
      </AxisLabels>
      {srTable}
    </Root>
  );
}
