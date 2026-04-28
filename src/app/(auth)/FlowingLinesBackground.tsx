"use client";

import { type ComponentRef, useEffect, useRef } from "react";
import styled from "styled-components";

type LineColor = { r: number; g: number; b: number };

type LinePoint = {
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  phaseX: number;
  phaseY: number;
  speedX: number;
  speedY: number;
};

type Line = {
  points: LinePoint[];
  color: LineColor;
  alpha: number;
  width: number;
};

const LINE_COLORS: [LineColor, ...LineColor[]] = [
  { r: 99, g: 91, b: 255 },
  { r: 0, g: 140, b: 255 },
  { r: 150, g: 120, b: 255 },
  { r: 0, g: 100, b: 220 },
  { r: 80, g: 70, b: 220 },
  { r: 30, g: 160, b: 255 },
];

const BackgroundRoot = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
`;

const BackgroundCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

function buildLines(width: number, height: number, count: number): Line[] {
  const out: Line[] = [];

  for (let i = 0; i < count; i++) {
    const segmentCount = 5 + Math.floor(Math.random() * 3);
    const points: LinePoint[] = [];

    for (let segment = 0; segment <= segmentCount; segment++) {
      points.push({
        baseX: (segment / segmentCount) * (width + 200) - 100,
        baseY: height * 0.15 + Math.random() * height * 0.7,
        ampX: 8 + Math.random() * 20,
        ampY: 15 + Math.random() * 40,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        speedX: 0.15 + Math.random() * 0.25,
        speedY: 0.2 + Math.random() * 0.3,
      });
    }

    out.push({
      points,
      color: LINE_COLORS[i % LINE_COLORS.length] ?? LINE_COLORS[0],
      alpha: 0.06 + Math.random() * 0.07,
      width: 1 + Math.random() * 1.5,
    });
  }

  return out;
}

export function FlowingLinesBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<ComponentRef<"canvas">>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rootElement = root;
    const canvasElement = canvas;
    const renderingContext = context;
    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let lines: Line[] = [];
    let raf: number | undefined;
    let visible = true;

    function resize() {
      const rect = rootElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvasElement.width = width * dpr;
      canvasElement.height = height * dpr;
      renderingContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      lines = buildLines(width, height, 8);
    }

    function drawLine(line: Line, time: number | null) {
      const points =
        time === null
          ? line.points.map((point) => ({ x: point.baseX, y: point.baseY }))
          : line.points.map((point) => ({
              x: point.baseX + Math.sin(time * point.speedX + point.phaseX) * point.ampX,
              y: point.baseY + Math.sin(time * point.speedY + point.phaseY) * point.ampY,
            }));

      const first = points[0];
      if (!first) return;

      renderingContext.beginPath();
      renderingContext.moveTo(first.x, first.y);

      for (let index = 0; index < points.length - 1; index++) {
        const current = points[index];
        const next = points[index + 1];
        if (!current || !next) continue;
        renderingContext.quadraticCurveTo(
          current.x,
          current.y,
          (current.x + next.x) / 2,
          (current.y + next.y) / 2,
        );
      }

      const last = points[points.length - 1] ?? first;
      renderingContext.lineTo(last.x, last.y);
      renderingContext.strokeStyle = `rgba(${line.color.r},${line.color.g},${line.color.b},${
        time === null ? line.alpha * 0.8 : line.alpha
      })`;
      renderingContext.lineWidth = line.width;
      renderingContext.lineCap = "round";
      renderingContext.lineJoin = "round";
      renderingContext.stroke();
    }

    function draw(time: number) {
      if (!visible) return;
      raf = window.requestAnimationFrame(draw);
      renderingContext.clearRect(0, 0, width, height);
      const seconds = time * 0.001;
      for (const line of lines) {
        drawLine(line, seconds);
      }
    }

    function drawStatic() {
      renderingContext.clearRect(0, 0, width, height);
      for (const line of lines) {
        drawLine(line, null);
      }
    }

    resize();

    if (prefersReduced) {
      drawStatic();
      return undefined;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible = true;
            raf = window.requestAnimationFrame(draw);
          } else {
            visible = false;
            if (raf) window.cancelAnimationFrame(raf);
          }
        }
      },
      { threshold: 0 },
    );

    observer.observe(rootElement);
    window.addEventListener("resize", resize, { passive: true });
    raf = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <BackgroundRoot ref={rootRef} aria-hidden="true">
      <BackgroundCanvas ref={canvasRef} aria-hidden="true" />
    </BackgroundRoot>
  );
}
