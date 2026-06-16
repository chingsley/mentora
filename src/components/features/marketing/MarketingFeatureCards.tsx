"use client";

import type { LucideIcon } from "lucide-react";
import styled from "styled-components";
import { MarketingCard, MarketingGridFour } from "@/components/features/marketing/marketingLayout";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_STROKE } from "@/constants/iconTheme.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { SPACING } from "@/constants/spacing.constants";

const Item = styled(MarketingCard).attrs({ as: "li" })`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  height: 100%;
  list-style: none;
`;

const Grid = styled(MarketingGridFour).attrs({ as: "ul" })`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const IconBox = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${MARKETING.FEATURE_ICON_BOX_SIZE};
  height: ${MARKETING.FEATURE_ICON_BOX_SIZE};
  border-radius: ${MARKETING.FEATURE_ICON_BOX_RADIUS};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  color: ${COLORS.ACTION_PRIMARY};
`;

const Text = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

export interface MarketingFeatureCardsProps {
  items: readonly { icon: LucideIcon; label: string }[];
}

export function MarketingFeatureCards({ items }: MarketingFeatureCardsProps) {
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
