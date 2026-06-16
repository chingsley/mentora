"use client";

import styled from "styled-components";
import { MarketingCtaBand } from "@/components/features/marketing/MarketingCtaBand";
import { MarketingPageHero } from "@/components/features/marketing/MarketingPageHero";
import {
  MarketingCard,
  MarketingGridThree,
  MarketingPageSection,
  MarketingSectionLead,
  MarketingSectionTitle,
  MarketingStack,
} from "@/components/features/marketing/marketingLayout";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING_ABOUT } from "@/constants/marketingContent";
import { SPACING } from "@/constants/spacing.constants";

const ValueItem = styled(MarketingCard).attrs({ as: "li" })`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  list-style: none;
`;

const ValueGrid = styled(MarketingGridThree).attrs({ as: "ul" })`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ValueTitle = styled.h3`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const ValueText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

const MissionPanel = styled(MarketingCard)`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const BodyCopy = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.MD};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

const StepItem = styled(MarketingCard).attrs({ as: "li" })`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  list-style: none;
`;

const StepsList = styled(MarketingGridThree).attrs({ as: "ol" })`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const StepBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${SPACING.EIGHT};
  height: ${SPACING.EIGHT};
  border-radius: ${LAYOUT.RADIUS.FULL};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
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

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

export function MarketingAboutPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="About Mentora"
        title={MARKETING_ABOUT.title}
        lead={MARKETING_ABOUT.lead}
        large
      />

      <MarketingPageSection>
        <MarketingStack>
          <MissionPanel>
            <MarketingSectionTitle>{MARKETING_ABOUT.missionTitle}</MarketingSectionTitle>
            <BodyCopy>{MARKETING_ABOUT.mission}</BodyCopy>
          </MissionPanel>

          <SectionBlock>
            <MarketingSectionTitle>What we stand for</MarketingSectionTitle>
            <ValueGrid>
              {MARKETING_ABOUT.values.map((value) => (
                <ValueItem key={value.title}>
                  <ValueTitle>{value.title}</ValueTitle>
                  <ValueText>{value.description}</ValueText>
                </ValueItem>
              ))}
            </ValueGrid>
          </SectionBlock>

          <SectionBlock>
            <MarketingSectionTitle>How Mentora works</MarketingSectionTitle>
            <MarketingSectionLead>Use the same flow whether you teach, learn, or support a student at home.</MarketingSectionLead>
            <StepsList>
              {MARKETING_ABOUT.steps.map((step) => (
                <StepItem key={step.step}>
                  <StepBadge aria-hidden>{step.step}</StepBadge>
                  <StepTitle>{step.title}</StepTitle>
                  <StepText>{step.description}</StepText>
                </StepItem>
              ))}
            </StepsList>
          </SectionBlock>
        </MarketingStack>
      </MarketingPageSection>

      <MarketingCtaBand
        title="Join Mentora today"
        lead="Set up your profile and connect with students, teachers, or guardians in your learning community."
      />
    </>
  );
}
