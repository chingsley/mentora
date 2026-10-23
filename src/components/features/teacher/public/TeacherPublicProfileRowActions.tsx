"use client";

import { MoreHorizontal } from "lucide-react";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const ActionsRoot = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const MenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: ${LAYOUT.RADIUS.SM};
  background: transparent;
  color: ${COLORS.MUTED_FOREGROUND};
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
    color: ${COLORS.HEADER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.RING};
    outline-offset: 2px;
  }
`;

const ActionMenu = styled.div<{ $open: boolean }>`
  position: absolute;
  top: calc(100% + ${SPACING.ONE});
  right: 0;
  z-index: ${LAYOUT.Z.STICKY};
  display: ${(p) => (p.$open ? "flex" : "none")};
  flex-direction: column;
  min-width: 9rem;
  padding: ${SPACING.ONE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.FOREGROUND};
  box-shadow: ${LAYOUT.SHADOW.MD};
`;

const MenuItemButton = styled.button<{ $destructive?: boolean }>`
  width: 100%;
  padding: ${SPACING.TWO} ${SPACING.THREE};
  border: none;
  border-radius: ${LAYOUT.RADIUS.SM};
  background: transparent;
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  text-align: left;
  color: ${(p) => (p.$destructive ? COLORS.DESTRUCTIVE : COLORS.HEADER)};
  cursor: pointer;

  &:hover {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.RING};
    outline-offset: -2px;
  }
`;

export interface TeacherPublicProfileRowActionsProps {
  itemId: string;
  itemLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TeacherPublicProfileRowActions({
  itemId,
  itemLabel,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TeacherPublicProfileRowActionsProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    function onDocMouseDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onOpenChange, open]);

  if (!onEdit && !onDelete) {
    return null;
  }

  return (
    <ActionsRoot ref={rootRef}>
      <MenuButton
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label={`Actions for ${itemLabel}`}
        onClick={() => onOpenChange(!open)}
      >
        <MoreHorizontal size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.MEDIUM} />
      </MenuButton>
      <ActionMenu $open={open} id={menuId} role="menu" aria-label={`${itemLabel} actions`}>
        {onEdit ? (
          <MenuItemButton
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onEdit(itemId);
            }}
          >
            Edit
          </MenuItemButton>
        ) : null}
        {onDelete ? (
          <MenuItemButton
            type="button"
            role="menuitem"
            $destructive
            onClick={() => {
              onOpenChange(false);
              onDelete(itemId);
            }}
          >
            Delete
          </MenuItemButton>
        ) : null}
      </ActionMenu>
    </ActionsRoot>
  );
}
