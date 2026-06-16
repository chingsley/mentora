"use client";

import type { LucideIcon } from "lucide-react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_STROKE } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { SPACING } from "@/constants/spacing.constants";

const Grid = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: ${MARKETING.FEATURES_GRID_GAP};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Item = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${SPACING.FOUR};
`;

const IconBox = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${MARKETING.FEATURE_ICON_BOX_SIZE};
  height: ${MARKETING.FEATURE_ICON_BOX_SIZE};
  border-radius: ${MARKETING.FEATURE_ICON_BOX_RADIUS};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  color: ${COLORS.ACTION_PRIMARY};
`;

const Text = styled.p`
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE.MD};
  }
`;

export interface MarketingFeatureGridProps {
  items: readonly { icon: LucideIcon; label: string }[];
}

export function MarketingFeatureGrid({ items }: MarketingFeatureGridProps) {
  return (
    <Grid>
      {items.map(({ icon: Icon, label }) => (
        <Item key={label}>
          <IconBox aria-hidden>
            <Icon size={MARKETING.FEATURE_ICON_GLYPH_SIZE} strokeWidth={ICON_STROKE.MEDIUM} />
          </IconBox>
          <Text>{label}</Text>
        </Item>
      ))}
    </Grid>
  );
}
