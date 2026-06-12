"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { SURFACE } from "@/constants/surface.constants";

const StyledCard = styled.div`
  background-color: ${SURFACE.BACKGROUND};
  border-radius: ${SURFACE.RADIUS};
  padding: ${SPACING.FIVE};
  box-shadow: ${SURFACE.SHADOW};
  border: 1px solid ${SURFACE.BORDER};

  ${LAYOUT.MEDIA.SM} {
    padding: ${SPACING.SIX};
  }
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  margin-bottom: ${SPACING.FOUR};
`;

const StyledTitle = styled.h2`
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  line-height: ${FONTS.LINE_HEIGHT.SNUG};
`;

const StyledDescription = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const StyledFooter = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.TWO};
  margin-top: ${SPACING.FIVE};
`;

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return <StyledCard {...props} />;
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <StyledHeader {...props} />;
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <StyledTitle {...props} />;
}

export function CardDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <StyledDescription {...props} />;
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <StyledContent {...props} />;
}

export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <StyledFooter {...props} />;
}
