"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import { CHIP, CHIP_TONE, type ChipTone } from "@/constants/chip.constants";

const Shell = styled.span<{ $tone: ChipTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: ${CHIP.PADDING_BLOCK} ${CHIP.PADDING_INLINE};
  border-radius: ${CHIP.RADIUS};
  border: 1px solid ${(p) => CHIP_TONE[p.$tone].border};
  background-color: ${(p) => CHIP_TONE[p.$tone].background};
  color: ${(p) => CHIP_TONE[p.$tone].color};
  font-size: ${CHIP.FONT_SIZE};
  font-weight: ${CHIP.FONT_WEIGHT};
  line-height: 1.2;
  white-space: nowrap;
`;

export interface ChipProps {
  tone?: ChipTone;
  children: ReactNode;
}

export function Chip({ tone = "neutral", children }: ChipProps) {
  return <Shell $tone={tone}>{children}</Shell>;
}
