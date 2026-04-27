"use client";

import styled, { keyframes } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const Bar = styled.div<{ $w: string; $h: string }>`
  height: ${(p) => p.$h};
  width: ${(p) => p.$w};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.MUTED};
  animation: ${pulse} 2s infinite;
`;

const CardGrid = styled.div`
  margin-top: ${SPACING.FOUR};
  display: grid;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const CardSkeleton = styled.div`
  height: 8rem;
  border-radius: ${LAYOUT.RADIUS.XL};
  background-color: ${COLORS.FOREGROUND};
  outline: 1px solid ${COLORS.RING_BLACK_5};
  outline-offset: -1px;
  animation: ${pulse} 2s infinite;
`;

export default function AppLoading() {
  return (
    <Wrap>
      <Bar $w="12rem" $h="2rem" />
      <Bar $w="16rem" $h="1rem" />
      <CardGrid>
        <CardSkeleton />
        <CardSkeleton />
      </CardGrid>
    </Wrap>
  );
}
