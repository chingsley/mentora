"use client";

import * as React from "react";
import styled, { keyframes } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

/**
 * Canonical app button. Single height/font/radius across the whole app —
 * width adapts to content. Use `variant` to switch role; do NOT add a
 * `size` prop here. If a one-off needs different geometry, wrap with
 * `styled(Button)` so the canonical defaults stay editable from one place.
 */
type Variant = "primary" | "secondary" | "ghost" | "destructive";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variantStyles = (variant: Variant): string => {
  switch (variant) {
    case "primary":
      return `
        background-color: ${COLORS.BUTTON_PRIMARY_BG};
        color: ${COLORS.BUTTON_PRIMARY_TEXT};
        &:hover:not(:disabled) { background-color: ${COLORS.BUTTON_PRIMARY_BG_HOVER}; }
      `;
    case "secondary":
      return `
        background-color: ${COLORS.BUTTON_SECONDARY_BG};
        color: ${COLORS.BUTTON_SECONDARY_TEXT};
        &:hover:not(:disabled) { background-color: ${COLORS.BUTTON_SECONDARY_BG_HOVER}; }
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
        &:hover:not(:disabled) { background-color: ${COLORS.DESTRUCTIVE_BORDER_HOVER}; }
      `;
  }
};

const StyledButton = styled.button<{ $variant: Variant; }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.TWO};
  padding: ${SPACING.TWO} ${SPACING.FIVE};
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: none;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;

  ${(p) => variantStyles(p.$variant)}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Inner = styled.span<{ $hidden: boolean; }>`
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
  { variant = "primary", isLoading, disabled, children, type, ...rest },
  ref,
) {
  return (
    <StyledButton
      ref={ref}
      type={type ?? "button"}
      $variant={variant}
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
