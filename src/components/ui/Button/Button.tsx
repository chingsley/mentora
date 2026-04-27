"use client";

import * as React from "react";
import styled, { keyframes } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const SIZE_STYLES: Record<Size, { height: string; padX: string; fontSize: string }> = {
  sm: { height: "2rem", padX: SPACING.THREE, fontSize: FONTS.SIZE.SM },
  md: { height: "2.5rem", padX: SPACING.FOUR, fontSize: FONTS.SIZE.SM },
  lg: { height: "3rem", padX: SPACING.FIVE, fontSize: FONTS.SIZE.BASE },
};

const variantStyles = (variant: Variant): string => {
  switch (variant) {
    case "primary":
      return `
        background-color: ${COLORS.HEADER};
        color: ${COLORS.WHITE};
        &:hover:not(:disabled) { background-color: rgba(23, 32, 51, 0.92); }
      `;
    case "secondary":
      return `
        background-color: ${COLORS.FOREGROUND};
        color: ${COLORS.HEADER};
        border: 1px solid ${COLORS.HEADER_BORDER_15};
        &:hover:not(:disabled) { border-color: ${COLORS.HEADER_BORDER_25}; }
      `;
    case "ghost":
      return `
        background-color: ${COLORS.TRANSPARENT};
        color: ${COLORS.HEADER};
        &:hover:not(:disabled) { background-color: ${COLORS.MUTED}; }
      `;
    case "destructive":
      return `
        background-color: ${COLORS.DESTRUCTIVE};
        color: ${COLORS.WHITE};
        &:hover:not(:disabled) { background-color: rgba(220, 38, 38, 0.9); }
      `;
  }
};

const StyledButton = styled.button<{ $variant: Variant; $size: Size }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.TWO};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;

  height: ${(p) => SIZE_STYLES[p.$size].height};
  padding: 0 ${(p) => SIZE_STYLES[p.$size].padX};
  font-size: ${(p) => SIZE_STYLES[p.$size].fontSize};

  ${(p) => variantStyles(p.$variant)}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Inner = styled.span<{ $hidden: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.TWO};
  opacity: ${(p) => (p.$hidden ? 0 : 1)};
`;

const SpinnerWrapper = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: ${spin} 0.6s linear infinite;
`;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", isLoading, disabled, children, type, ...rest },
  ref,
) {
  return (
    <StyledButton
      ref={ref}
      type={type ?? "button"}
      $variant={variant}
      $size={size}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      <Inner $hidden={!!isLoading}>{children}</Inner>
      {isLoading ? (
        <SpinnerWrapper aria-hidden>
          <Spinner />
        </SpinnerWrapper>
      ) : null}
    </StyledButton>
  );
});
