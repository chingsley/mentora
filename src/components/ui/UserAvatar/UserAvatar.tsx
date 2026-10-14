"use client";

import Image from "next/image";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { DASHBOARD } from "@/constants/dashboard.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_THEME } from "@/constants/iconTheme.constants";
import { initialsFromName } from "@/lib/userInitials";

export interface UserAvatarProps {
  name: string;
  image?: string | null;
  className?: string;
}

const Root = styled.div<{ $hasPhoto: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  height: ${ICON_THEME.METRIC_ICON_BOX_SIZE};
  flex-shrink: 0;
  overflow: hidden;
  border-radius: ${ICON_THEME.METRIC_ICON_BOX_RADIUS};
  background-color: ${(p) =>
    p.$hasPhoto ? COLORS.MUTED : DASHBOARD.ICON_TILE_BACKGROUND};
  outline: ${(p) => (p.$hasPhoto ? `1px solid ${DASHBOARD.CARD_BORDER}` : "none")};
  outline-offset: -1px;
`;

const Fallback = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${DASHBOARD.ICON_TILE_COLOR};
`;

export function UserAvatar({ name, image, className }: UserAvatarProps) {
  const hasPhoto = Boolean(image);
  const initials = initialsFromName(name);

  return (
    <Root className={className} $hasPhoto={hasPhoto}>
      {image ? (
        <Image
          src={image}
          alt={`${name} profile photo`}
          fill
          sizes={ICON_THEME.METRIC_ICON_BOX_SIZE}
          style={{ objectFit: "cover" }}
          unoptimized
        />
      ) : (
        <Fallback>{initials}</Fallback>
      )}
    </Root>
  );
}
