"use client";

import { X } from "lucide-react";
import * as React from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { SURFACE } from "@/constants/surface.constants";

export type DialogSize = "sm" | "md" | "lg" | "xl";
export type DialogPlacement = "center" | "right";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Rendered directly under the title, before dialog body content. */
  titleBelow?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: DialogSize;
  /** `right` slides in from the viewport edge (create/edit flows). Default: center. */
  placement?: DialogPlacement;
  /** Shows an X control in the panel header. Default: true when `placement` is `right`. */
  showCloseButton?: boolean;
}

const SIZE_MAX_WIDTH: Record<DialogSize, string> = {
  sm: "24rem",
  md: "28rem",
  lg: "42rem",
  xl: "56rem",
};

const Backdrop = styled.div<{ $placement: DialogPlacement }>`
  position: fixed;
  inset: 0;
  z-index: ${LAYOUT.Z.MODAL};
  display: flex;

  ${(p) =>
    p.$placement === "right"
      ? css`
          align-items: stretch;
          justify-content: flex-end;
          padding: 0;
        `
      : css`
          align-items: center;
          justify-content: center;
          padding: ${SPACING.FOUR};
        `}
`;

const BackdropButton = styled.button`
  position: absolute;
  inset: 0;
  background-color: ${COLORS.MODAL_BACKDROP};
  border: none;
  cursor: pointer;
`;

const Panel = styled.div<{
  $size: DialogSize;
  $placement: DialogPlacement;
  $entered: boolean;
}>`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${SURFACE.BACKGROUND};
  box-shadow: ${SURFACE.SHADOW};
  border: 1px solid ${SURFACE.BORDER};
  overflow: hidden;

  ${(p) =>
    p.$placement === "right"
      ? css`
          max-width: min(${SIZE_MAX_WIDTH[p.$size]}, 100vw);
          height: 100%;
          max-height: 100dvh;
          border-radius: 0;
          border-top: none;
          border-right: none;
          border-bottom: none;
          box-shadow: ${LAYOUT.SHADOW.XL};
          transform: translateX(${p.$entered ? "0" : "100%"});
          transition: transform ${LAYOUT.MOTION.DRAWER_DURATION} ${LAYOUT.MOTION.DRAWER_EASING};

          ${LAYOUT.MEDIA.REDUCED_MOTION} {
            transition: none;
            transform: none;
          }
        `
      : css`
          max-width: ${SIZE_MAX_WIDTH[p.$size]};
          max-height: calc(100vh - 2rem);
          border-radius: ${SURFACE.RADIUS};
        `}
`;

const PanelHeader = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${SPACING.THREE};
  padding: ${SPACING.SIX} ${SPACING.SIX} ${SPACING.FOUR};
  background-color: ${SURFACE.BACKGROUND};
  border-bottom: 1px solid ${SURFACE.BORDER};
`;

const PanelBody = styled.div<{ $padTop: boolean }>`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-inline: ${SPACING.SIX};
  padding-bottom: ${SPACING.SIX};
  padding-top: ${(p) => (p.$padTop ? SPACING.SIX : SPACING.FOUR)};
`;

const PanelTitle = styled.h2<{ $hasTitleBelow: boolean }>`
  margin: 0;
  flex: 1;
  min-width: 0;
  margin-bottom: ${(p) => (p.$hasTitleBelow ? SPACING.ONE : "0")};
  font-size: ${FONTS.SIZE.LG};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
`;

const TitleBelow = styled.div`
  margin-top: ${SPACING.ONE};
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  height: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  margin: calc(-1 * ${SPACING.ONE}) calc(-1 * ${SPACING.ONE}) 0 0;
  border: none;
  border-radius: ${LAYOUT.RADIUS.SM};
  background: transparent;
  color: ${ICON_THEME.INLINE_SUBTLE};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: ${COLORS.MUTED};
    color: ${COLORS.HEADER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
  }
`;

export function Dialog({
  open,
  onClose,
  title,
  titleBelow,
  children,
  className,
  size = "md",
  placement = "center",
  showCloseButton,
}: DialogProps) {
  const resolvedShowCloseButton = showCloseButton ?? placement === "right";
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useLayoutEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  if (!open) return null;

  const hasTitleBlock = Boolean(title || titleBelow);
  const showHeader = resolvedShowCloseButton || hasTitleBlock;

  return (
    <Backdrop role="dialog" aria-modal="true" aria-label={title} $placement={placement}>
      <BackdropButton aria-label="Close dialog" onClick={onClose} />
      <Panel className={className} $size={size} $placement={placement} $entered={entered}>
        {showHeader ? (
          <PanelHeader>
            {hasTitleBlock ? (
              <div>
                {title ? <PanelTitle $hasTitleBelow={!!titleBelow}>{title}</PanelTitle> : null}
                {titleBelow ? <TitleBelow>{titleBelow}</TitleBelow> : null}
              </div>
            ) : (
              <span aria-hidden />
            )}
            {resolvedShowCloseButton ? (
              <CloseButton type="button" aria-label="Close dialog" onClick={onClose}>
                <X size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} aria-hidden />
              </CloseButton>
            ) : null}
          </PanelHeader>
        ) : null}
        <PanelBody $padTop={!showHeader}>{children}</PanelBody>
      </Panel>
    </Backdrop>
  );
}
