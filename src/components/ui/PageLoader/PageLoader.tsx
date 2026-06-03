"use client";

import styled, { keyframes } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export interface PageLoaderProps {
  className?: string;
  /**
   * Fills the viewport with a soft gradient — use at the root `loading.tsx` before
   * any shell layout is shown.
   */
  fullViewport?: boolean;
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-120%); }
  100% { transform: translateX(320%); }
`;

const Root = styled.div<{ $fullViewport: boolean }>`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-inline: ${SPACING.SIX};

  ${(p) =>
    p.$fullViewport
      ? `
    min-height: 100dvh;
    background: linear-gradient(
      to bottom,
      ${COLORS.BACKGROUND},
      ${COLORS.BACKGROUND},
      ${COLORS.PAGE_LOADER_GRADIENT_END}
    );
  `
      : `
    min-height: ${LAYOUT.PAGE_LOADER.MIN_HEIGHT};
    padding-block: ${SPACING.TEN};
  `}
`;

const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Stack = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.SIX};
`;

const Glow = styled.div`
  pointer-events: none;
  position: absolute;
  inset: -${LAYOUT.PAGE_LOADER.GLOW_INSET};
  border-radius: ${LAYOUT.RADIUS.FULL};
  opacity: 0.9;
  filter: blur(${LAYOUT.PAGE_LOADER.GLOW_BLUR});
  background: radial-gradient(
    closest-side,
    ${COLORS.ACTION_PRIMARY_TINT_16},
    ${COLORS.TRANSPARENT} 72%
  );
`;

const SpinnerGrid = styled.div`
  position: relative;
  display: grid;
  place-items: center;
`;

const SpinnerTrack = styled.div`
  grid-area: 1 / 1;
  width: ${LAYOUT.PAGE_LOADER.SPINNER_SIZE};
  height: ${LAYOUT.PAGE_LOADER.SPINNER_SIZE};
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 2px solid ${COLORS.PAGE_LOADER_TRACK_BORDER};
  box-shadow: 0 1px 0 0 ${COLORS.BORDER};
`;

const SpinnerArc = styled.div`
  grid-area: 1 / 1;
  width: ${LAYOUT.PAGE_LOADER.SPINNER_SIZE};
  height: ${LAYOUT.PAGE_LOADER.SPINNER_SIZE};
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 2px solid ${COLORS.TRANSPARENT};
  border-top-color: ${COLORS.ACTION_PRIMARY};
  border-right-color: ${COLORS.ACTION_PRIMARY_RING_45};
  animation: ${spin} ${LAYOUT.PAGE_LOADER.SPIN_DURATION} linear infinite;

  ${LAYOUT.MEDIA.REDUCED_MOTION} {
    animation: none;
  }
`;

const LabelBlock = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const Label = styled.p`
  margin: 0;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ShimmerTrack = styled.div`
  display: flex;
  height: ${LAYOUT.PAGE_LOADER.SHIMMER_TRACK_HEIGHT};
  width: ${LAYOUT.PAGE_LOADER.SHIMMER_TRACK_WIDTH};
  overflow: hidden;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.MUTED};
`;

const ShimmerBar = styled.div`
  height: 100%;
  width: 33%;
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.ACTION_PRIMARY_RING_45};
  animation: ${shimmer} ${LAYOUT.PAGE_LOADER.SHIMMER_DURATION} ease-in-out infinite;

  ${LAYOUT.MEDIA.REDUCED_MOTION} {
    animation: none;
    width: 100%;
    opacity: 0.7;
  }
`;

export function PageLoader({ className, fullViewport = false }: PageLoaderProps) {
  return (
    <Root
      className={className}
      $fullViewport={fullViewport}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <SrOnly>Loading page, please wait</SrOnly>
      <Stack>
        <Glow aria-hidden />
        <SpinnerGrid aria-hidden>
          <SpinnerTrack />
          <SpinnerArc />
        </SpinnerGrid>
        <LabelBlock>
          <Label>Loading</Label>
          <ShimmerTrack aria-hidden>
            <ShimmerBar />
          </ShimmerTrack>
        </LabelBlock>
      </Stack>
    </Root>
  );
}
