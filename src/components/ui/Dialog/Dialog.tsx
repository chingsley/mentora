"use client";

import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export type DialogSize = "sm" | "md" | "lg" | "xl";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: DialogSize;
}

const SIZE_MAX_WIDTH: Record<DialogSize, string> = {
  sm: "24rem",
  md: "28rem",
  lg: "42rem",
  xl: "56rem",
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${LAYOUT.Z.MODAL};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${SPACING.FOUR};
`;

const BackdropButton = styled.button`
  position: absolute;
  inset: 0;
  background-color: ${COLORS.MODAL_BACKDROP};
  border: none;
  cursor: pointer;
`;

const Panel = styled.div<{ $size: DialogSize }>`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: ${(p) => SIZE_MAX_WIDTH[p.$size]};
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  background-color: ${COLORS.FOREGROUND};
  border-radius: ${LAYOUT.RADIUS.XL};
  padding: ${SPACING.SIX};
  box-shadow: ${LAYOUT.SHADOW.XL};
`;

const PanelTitle = styled.h2`
  margin-bottom: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

export function Dialog({ open, onClose, title, children, className, size = "md" }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Backdrop role="dialog" aria-modal="true" aria-label={title}>
      <BackdropButton aria-label="Close dialog" onClick={onClose} />
      <Panel className={className} $size={size}>
        {title ? <PanelTitle>{title}</PanelTitle> : null}
        {children}
      </Panel>
    </Backdrop>
  );
}
