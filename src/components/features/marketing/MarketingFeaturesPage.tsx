"use client";

import styled from "styled-components";
import { MarketingCtaBand } from "@/components/features/marketing/MarketingCtaBand";
import { MarketingPageHero } from "@/components/features/marketing/MarketingPageHero";
import {
  MarketingCard,
  MarketingGridTwo,
  MarketingPageSection,
  MarketingSectionLead,
  MarketingSectionTitle,
  MarketingStack,
} from "@/components/features/marketing/marketingLayout";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_STROKE } from "@/constants/iconTheme.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { MARKETING_FEATURE_SECTIONS } from "@/constants/marketingContent";
import { SPACING } from "@/constants/spacing.constants";

const SectionBlock = styled(MarketingCard).attrs({ as: "section" })`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

const DetailGrid = styled(MarketingGridTwo).attrs({ as: "ul" })`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const DetailItem = styled(MarketingCard).attrs({ as: "li" })`
  display: flex;
  gap: ${SPACING.FOUR};
  align-items: flex-start;
  list-style: none;
`;

const DetailIcon = styled.span`
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

const DetailCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  min-width: 0;
`;

const DetailTitle = styled.h3`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const DetailText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

export function MarketingFeaturesPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Platform features"
        title="Everything you need to teach and learn online"
        lead="Mentora brings discovery, scheduling, live classes, assignments, and guardian visibility into one platform — tailored for each role."
        large
      />

      <MarketingPageSection>
        <MarketingStack>
          {MARKETING_FEATURE_SECTIONS.map((section) => (
            <SectionBlock key={section.id} aria-labelledby={`features-${section.id}`}>
              <div>
                <MarketingSectionTitle id={`features-${section.id}`}>{section.title}</MarketingSectionTitle>
                <MarketingSectionLead>{section.description}</MarketingSectionLead>
              </div>
              <DetailGrid>
                {section.items.map(({ icon: Icon, title, description }) => (
                  <DetailItem key={title}>
                    <DetailIcon aria-hidden>
                      <Icon size={MARKETING.FEATURE_ICON_GLYPH_SIZE} strokeWidth={ICON_STROKE.MEDIUM} />
                    </DetailIcon>
                    <DetailCopy>
                      <DetailTitle>{title}</DetailTitle>
                      <DetailText>{description}</DetailText>
                    </DetailCopy>
                  </DetailItem>
                ))}
              </DetailGrid>
            </SectionBlock>
          ))}
        </MarketingStack>
      </MarketingPageSection>

      <MarketingCtaBand
        title="See it in action"
        lead="Create a free account and explore the dashboard for your role in minutes."
        secondaryHref="/pricing"
        secondaryLabel="View pricing"
      />
    </>
  );
}
