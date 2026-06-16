"use client";

import styled from "styled-components";
import { MarketingPageHero } from "@/components/features/marketing/MarketingPageHero";
import { MarketingCard, MarketingPageSection } from "@/components/features/marketing/marketingLayout";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

const SectionBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const Paragraph = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

export interface MarketingLegalPageProps {
  title: string;
  lead: string;
  sections: readonly { title: string; body: string }[];
}

export function MarketingLegalPage({ title, lead, sections }: MarketingLegalPageProps) {
  return (
    <>
      <MarketingPageHero title={title} lead={lead} />
      <MarketingPageSection>
        <MarketingCard>
          <Body>
            {sections.map((section) => (
              <SectionBlock key={section.title}>
                <SectionTitle>{section.title}</SectionTitle>
                <Paragraph>{section.body}</Paragraph>
              </SectionBlock>
            ))}
          </Body>
        </MarketingCard>
      </MarketingPageSection>
    </>
  );
}
