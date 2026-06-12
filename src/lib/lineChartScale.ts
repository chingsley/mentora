export type LineChartYAxisMode = "percent" | "count" | "currency";

export function niceChartMax(rawMax: number, mode: LineChartYAxisMode): number {
  if (mode === "percent") return 100;
  if (rawMax <= 0) return mode === "count" ? 4 : 1;
  const magnitude = 10 ** Math.floor(Math.log10(rawMax));
  const normalized = rawMax / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

export function chartYAxisTicks(maxValue: number, mode: LineChartYAxisMode): number[] {
  if (mode === "percent") return [0, 25, 50, 75, 100];
  const steps = 4;
  const step = maxValue / steps;
  return Array.from({ length: steps + 1 }, (_, index) =>
    Math.round(step * index),
  );
}

export function buildSmoothLinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  const first = points[0];
  if (!first) return "";
  if (points.length === 1) return `M ${first.x} ${first.y}`;

  let path = `M ${first.x} ${first.y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    if (!current || !next) continue;
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export function buildSmoothAreaPath(points: Array<{ x: number; y: number }>, baseline: number): string {
  if (points.length === 0) return "";
  const line = buildSmoothLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return "";
  return `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}
