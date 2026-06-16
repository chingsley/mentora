"use client";

import Link from "next/link";
import { BookOpen, GraduationCap, Shield } from "lucide-react";
import styled from "styled-components";
import { MarketingCtaBand } from "@/components/features/marketing/MarketingCtaBand";
import { MarketingPageHero } from "@/components/features/marketing/MarketingPageHero";
import {
  MarketingCard,
  MarketingGridThree,
  MarketingPageSection,
  MarketingPrimaryCta,
  MarketingStack,
} from "@/components/features/marketing/marketingLayout";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_SIZE, ICON_STROKE, ICON_THEME } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { MARKETING_PRICING } from "@/constants/marketingContent";
import { SPACING } from "@/constants/spacing.constants";

const roleIcons = {
  students: BookOpen,
  teachers: GraduationCap,
  guardians: Shield,
} as const;

const PlanGrid = styled(MarketingGridThree).attrs({ as: "ul" })`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const PlanCard = styled(MarketingCard).attrs({ as: "li" })`
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
  position: relative;
  padding: ${SPACING.SIX};
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${LAYOUT.SHADOW.LG};
  }
`;

const IconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: ${LAYOUT.RADIUS.LG};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  color: ${COLORS.ACTION_PRIMARY};
  margin-bottom: ${SPACING.FIVE};
`;

const PlanName = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const PlanPrice = styled.p`
  margin: ${SPACING.THREE} 0 0;
  font-size: ${FONTS.SIZE.H1};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
`;

const PlanPriceSub = styled.span`
  display: block;
  margin-top: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  color: ${COLORS.MARKETING_TEXT_TERTIARY};
`;

const Divider = styled.hr`
  margin: ${SPACING.FOUR} 0;
  border: none;
  height: 1px;
  background-color: ${COLORS.MARKETING_BORDER};
`;

const PlanDescription = styled.p`
  margin: 0 0 ${SPACING.FIVE};
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

const HighlightList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const HighlightItem = styled.li`
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
  padding-left: 0;

  &::before {
    content: "✓";
    margin-right: ${SPACING.TWO};
    color: ${COLORS.ACTION_PRIMARY};
    font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  }
`;

const PlanCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: ${MARKETING.CTA_MIN_HEIGHT};
  padding: 0 ${SPACING.SIX};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.ACTION_PRIMARY};
  color: ${COLORS.WHITE};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  text-decoration: none;
  margin-top: auto;
  transition:
    background-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    background-color: ${COLORS.ACTION_PRIMARY_HOVER};
    transform: translateY(-1px);
    box-shadow: ${COLORS.ACTION_PRIMARY_SHADOW_MD};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
  }
`;

const NotePanel = styled(MarketingCard)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.SIX};
  padding: ${SPACING.SIX};

  ${LAYOUT.MEDIA.MD} {
    flex-direction: row;
  }
`;

const Note = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_TERTIARY};
  flex: 1;
`;

export function MarketingPricingPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Pricing"
        title={MARKETING_PRICING.title}
        lead={MARKETING_PRICING.lead}
        large
      />

      <MarketingPageSection>
        <MarketingStack>
          <PlanGrid>
            {MARKETING_PRICING.plans.map((plan) => {
              const Icon = roleIcons[plan.id as keyof typeof roleIcons];

              return (
                <PlanCard key={plan.id}>
                  <IconBox>
                    <Icon size={ICON_SIZE.LG} strokeWidth={ICON_STROKE.MEDIUM} />
                  </IconBox>
                  <PlanName>{plan.name}</PlanName>
                  <PlanPrice>
                    {plan.price}
                    <PlanPriceSub>
                      {plan.id === "students"
                        ? "per hour — pay per session"
                        : plan.id === "teachers"
                          ? "on every session you teach"
                          : "for guardians"}
                    </PlanPriceSub>
                  </PlanPrice>
                  <Divider />
                  <PlanDescription>{plan.description}</PlanDescription>
                  <HighlightList>
                    {plan.highlights.map((highlight) => (
                      <HighlightItem key={highlight}>{highlight}</HighlightItem>
                    ))}
                  </HighlightList>
                  <PlanCta href={plan.ctaHref}>{plan.ctaLabel}</PlanCta>
                </PlanCard>
              );
            })}
          </PlanGrid>

          <NotePanel>
            <Note>{MARKETING_PRICING.note}</Note>
            <MarketingPrimaryCta href="/contact">
              Contact sales
            </MarketingPrimaryCta>
          </NotePanel>
        </MarketingStack>
      </MarketingPageSection>

      <MarketingCtaBand
        title="Start with the plan that fits your role"
        lead="Students, teachers, and guardians can all get started for free today."
        secondaryHref="/features"
        secondaryLabel="Compare features"
      />
    </>
  );
}
