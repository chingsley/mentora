"use client";

import styled from "styled-components";
import {
  MarketingDisplayLead,
  MarketingDisplayTitle,
  MarketingEyebrow,
  MarketingPageLead,
  MarketingPageTitle,
} from "@/components/features/marketing/marketingLayout";
import { COLORS } from "@/constants/colors.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { SPACING } from "@/constants/spacing.constants";

const HeroBand = styled.section`
  position: relative;
  overflow: hidden;
  background: ${MARKETING.HERO_GRADIENT};
  border-bottom: 1px solid ${COLORS.MARKETING_BORDER};
`;

const Glow = styled.div`
  pointer-events: none;
  position: absolute;
  top: calc(-1 * ${MARKETING.HERO_GLOW_SIZE} / 2);
  right: calc(-1 * ${MARKETING.HERO_GLOW_SIZE} / 4);
  width: ${MARKETING.HERO_GLOW_SIZE};
  height: ${MARKETING.HERO_GLOW_SIZE};
  border-radius: 50%;
  background: radial-gradient(circle, ${COLORS.MARKETING_HERO_GLOW_STRONG} 0%, transparent 70%);
`;

const Inner = styled.div`
  position: relative;
  margin: 0 auto;
  max-width: ${MARKETING.MAX_WIDTH};
  padding: ${MARKETING.PAGE_HERO_PADDING_BLOCK} ${MARKETING.PAGE_PADDING_INLINE};
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  max-width: ${MARKETING.PAGE_TITLE_MAX_WIDTH};
`;

export interface MarketingPageHeroProps {
  eyebrow?: string;
  title: string;
  lead: string;
  large?: boolean;
}

export function MarketingPageHero({ eyebrow, title, lead, large = false }: MarketingPageHeroProps) {
  const Title = large ? MarketingDisplayTitle : MarketingPageTitle;
  const Lead = large ? MarketingDisplayLead : MarketingPageLead;

  return (
    <HeroBand>
      <Glow aria-hidden />
      <Inner>
        <Stack>
          {eyebrow ? <MarketingEyebrow>{eyebrow}</MarketingEyebrow> : null}
          <Title>{title}</Title>
          <Lead>{lead}</Lead>
        </Stack>
      </Inner>
    </HeroBand>
  );
}
