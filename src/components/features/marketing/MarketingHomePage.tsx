"use client";

import Link from "next/link";
import styled from "styled-components";
import { MarketingCtaBand } from "@/components/features/marketing/MarketingCtaBand";
import { MarketingFeatureCards } from "@/components/features/marketing/MarketingFeatureCards";
import {
  MarketingAltSection,
  MarketingAltSectionInner,
  MarketingCard,
  MarketingDisplayLead,
  MarketingDisplayTitle,
  MarketingDisplayTitleAccent,
  MarketingEyebrow,
  MarketingGridThree,
  MarketingRoleCtaRow,
  MarketingSectionHeader,
  MarketingSectionLead,
  MarketingSectionTitle,
} from "@/components/features/marketing/marketingLayout";
import { MarketingProductPreview } from "@/components/features/marketing/MarketingProductPreview";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING } from "@/constants/marketing.constants";
import {
  MARKETING_HOME,
  MARKETING_HOME_FEATURES,
  MARKETING_HOME_ROLES,
  MARKETING_HOME_STATS,
  MARKETING_HOME_STEPS,
} from "@/constants/marketingContent";
import { SPACING } from "@/constants/spacing.constants";

const HeroBand = styled.section`
  position: relative;
  overflow: hidden;
  background: ${MARKETING.HERO_GRADIENT};
  border-bottom: 1px solid ${COLORS.MARKETING_BORDER};
`;

const HeroGlow = styled.div`
  pointer-events: none;
  position: absolute;
  top: calc(-1 * ${MARKETING.HERO_GLOW_SIZE} / 2);
  right: 10%;
  width: ${MARKETING.HERO_GLOW_SIZE};
  height: ${MARKETING.HERO_GLOW_SIZE};
  border-radius: 50%;
  background: radial-gradient(circle, ${COLORS.MARKETING_HERO_GLOW_STRONG} 0%, transparent 70%);
`;

const HeroInner = styled.div`
  position: relative;
  margin: 0 auto;
  max-width: ${MARKETING.MAX_WIDTH};
  padding: ${MARKETING.HERO_PADDING_BLOCK} ${MARKETING.HERO_PADDING_INLINE};
  display: grid;
  gap: ${MARKETING.HERO_GRID_GAP};
  grid-template-columns: 1fr;
  align-items: center;

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  }
`;

const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
  min-width: 0;
`;

const StatsRow = styled.ul`
  margin: ${SPACING.FOUR} 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: ${SPACING.FOUR};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const StatItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  padding-top: ${SPACING.FOUR};
  border-top: 1px solid ${COLORS.MARKETING_BORDER};
`;

const StatValue = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const StatLabel = styled.span`
  font-size: ${FONTS.SIZE.XS};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_TERTIARY};
`;

const RoleCard = styled(MarketingCard).attrs({ as: "article" })`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  height: 100%;
`;

const RoleTitle = styled.h3`
  margin: 0;
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const RoleText = styled.p`
  margin: 0;
  flex: 1;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

const RoleLink = styled(Link)`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.ACTION_PRIMARY};
  text-decoration: none;

  &:hover {
    color: ${COLORS.ACTION_PRIMARY_HOVER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_28};
    outline-offset: 2px;
    border-radius: ${LAYOUT.RADIUS.MD};
  }
`;

const StepCard = styled(MarketingCard).attrs({ as: "li" })`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  list-style: none;
`;

const StepBadge = styled.span`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  color: ${COLORS.ACTION_PRIMARY};
`;

const StepTitle = styled.h3`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const StepText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

const StepsGrid = styled(MarketingGridThree).attrs({ as: "ol" })`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const RolesSection = styled(MarketingAltSection)`
  background-color: ${COLORS.BACKGROUND};
  border-bottom: none;
`;

const RolesGrid = styled(MarketingGridThree)``;

export function MarketingHomePage() {
  return (
    <>
      <HeroBand>
        <HeroGlow aria-hidden />
        <HeroInner>
          <HeroCopy>
            <MarketingEyebrow>{MARKETING_HOME.eyebrow}</MarketingEyebrow>
            <MarketingDisplayTitle>
              Learn <MarketingDisplayTitleAccent>any subject</MarketingDisplayTitleAccent>, from{" "}
              <MarketingDisplayTitleAccent>great teachers</MarketingDisplayTitleAccent>, on your schedule.
            </MarketingDisplayTitle>
            <MarketingDisplayLead>{MARKETING_HOME.lead}</MarketingDisplayLead>
            <MarketingRoleCtaRow />
            <StatsRow>
              {MARKETING_HOME_STATS.map((stat) => (
                <StatItem key={stat.value}>
                  <StatValue>{stat.value}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatItem>
              ))}
            </StatsRow>
          </HeroCopy>
          <MarketingProductPreview />
        </HeroInner>
      </HeroBand>

      <MarketingAltSection>
        <MarketingAltSectionInner>
          <MarketingSectionHeader>
            <MarketingSectionTitle>{MARKETING_HOME.featuresTitle}</MarketingSectionTitle>
            <MarketingSectionLead>{MARKETING_HOME.featuresLead}</MarketingSectionLead>
          </MarketingSectionHeader>
          <MarketingFeatureCards items={MARKETING_HOME_FEATURES} />
        </MarketingAltSectionInner>
      </MarketingAltSection>

      <RolesSection>
        <MarketingAltSectionInner>
          <MarketingSectionHeader>
            <MarketingSectionTitle>{MARKETING_HOME.rolesTitle}</MarketingSectionTitle>
            <MarketingSectionLead>{MARKETING_HOME.rolesLead}</MarketingSectionLead>
          </MarketingSectionHeader>
          <RolesGrid>
            {MARKETING_HOME_ROLES.map((role) => (
              <RoleCard key={role.id}>
                <RoleTitle>{role.title}</RoleTitle>
                <RoleText>{role.description}</RoleText>
                <RoleLink href={role.href}>{role.cta} →</RoleLink>
              </RoleCard>
            ))}
          </RolesGrid>
        </MarketingAltSectionInner>
      </RolesSection>

      <MarketingAltSection>
        <MarketingAltSectionInner>
          <MarketingSectionHeader>
            <MarketingSectionTitle>{MARKETING_HOME.stepsTitle}</MarketingSectionTitle>
            <MarketingSectionLead>{MARKETING_HOME.stepsLead}</MarketingSectionLead>
          </MarketingSectionHeader>
          <StepsGrid>
            {MARKETING_HOME_STEPS.map((step) => (
              <StepCard key={step.step}>
                <StepBadge>{step.step}</StepBadge>
                <StepTitle>{step.title}</StepTitle>
                <StepText>{step.description}</StepText>
              </StepCard>
            ))}
          </StepsGrid>
        </MarketingAltSectionInner>
      </MarketingAltSection>

      <MarketingCtaBand
        title="Ready to get started?"
        lead="Create a free account, explore teachers near you, or set up your tutoring profile today."
        secondaryHref="/features"
        secondaryLabel="Explore features"
      />
    </>
  );
}
