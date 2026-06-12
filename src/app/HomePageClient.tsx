"use client";

import Link from "next/link";
import { Calendar, GraduationCap, Search, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styled from "styled-components";
import { SiteHeader } from "@/components/layouts/SiteHeader";
import { MarketingSecondaryCtaLink } from "@/components/ui/Link";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { ICON_STROKE } from "@/constants/iconTheme.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { SPACING } from "@/constants/spacing.constants";

const Main = styled.main`
  min-height: 100dvh;
  background-color: ${COLORS.BACKGROUND};
`;

const Hero = styled.section`
  margin: 0 auto;
  max-width: ${MARKETING.MAX_WIDTH};
  padding: ${MARKETING.HERO_PADDING_BLOCK} ${MARKETING.HERO_PADDING_INLINE};
  display: flex;
  flex-direction: column;
  gap: ${MARKETING.FEATURES_SECTION_OFFSET};
`;

const HeroStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${SPACING.EIGHT};
  width: ${MARKETING.HERO_STACK_WIDTH};
  max-width: 100%;
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${FONTS.SIZE.HERO};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.HERO};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE.MARKETING_HERO};
  }
`;

const Lead = styled.p`
  margin: 0;
  max-width: 100%;
  font-size: ${FONTS.SIZE.MD};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE.LG};
  }
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.THREE};
`;

const PrimaryCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${MARKETING.CTA_MIN_HEIGHT};
  padding: 0 ${SPACING.FIVE};
  border-radius: ${MARKETING.CTA_RADIUS};
  background-color: ${MARKETING.CTA_PRIMARY_BG};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${MARKETING.CTA_PRIMARY_TEXT};
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${MARKETING.CTA_PRIMARY_BG_HOVER};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
  }
`;

const FeaturesPanel = styled.section`
  width: 100%;
  background-color: ${COLORS.FOREGROUND};
  border: 1px solid ${COLORS.MARKETING_BORDER};
  border-radius: ${MARKETING.FEATURES_PANEL_RADIUS};
  padding: ${MARKETING.FEATURES_PANEL_PADDING};
`;

const FeaturesTitle = styled.h2`
  margin: 0 0 ${SPACING.SIX};
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

const FeatureGrid = styled.ul`
  margin: 0;
  padding: 0;
  display: grid;
  gap: ${MARKETING.FEATURES_GRID_GAP};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FeatureItem = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${SPACING.FOUR};
`;

const FeatureIconBox = styled.span`
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

const FeatureText = styled.p`
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

const Footer = styled.footer`
  margin: 0 auto;
  max-width: ${MARKETING.MAX_WIDTH};
  padding: ${SPACING.TEN} ${MARKETING.HERO_PADDING_INLINE};
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MARKETING_TEXT_TERTIARY};
`;

interface HomepageFeature {
  icon: LucideIcon;
  label: string;
}

const FEATURES: readonly HomepageFeature[] = [
  {
    icon: Search,
    label: "Smart search and recommendations based on your interests.",
  },
  {
    icon: Calendar,
    label: "Flexible scheduling with automatic capacity control.",
  },
  {
    icon: GraduationCap,
    label: "Virtual classrooms, assignments, and grades in one place.",
  },
  {
    icon: Users,
    label: "Guardian accounts with read-only progress visibility.",
  },
] as const;

export function HomePageClient() {
  return (
    <Main>
      <SiteHeader sticky />

      <Hero>
        <HeroStack>
          <Title>Learn any subject, from great teachers, on your schedule.</Title>
          <Lead>
            Mentora connects students with vetted tutors. Search by subject, pick a time
            that works for you, and join your virtual classroom in one click. Guardians get
            a read-only dashboard of progress.
          </Lead>

          <CtaRow>
            <PrimaryCta href="/register?role=STUDENT">I&apos;m a student</PrimaryCta>
            <MarketingSecondaryCtaLink href="/register?role=TEACHER">I&apos;m a teacher</MarketingSecondaryCtaLink>
            <MarketingSecondaryCtaLink href="/register?role=GUARDIAN">I&apos;m a guardian</MarketingSecondaryCtaLink>
          </CtaRow>
        </HeroStack>

        <FeaturesPanel aria-labelledby="homepage-features-title">
          <FeaturesTitle id="homepage-features-title">What you get with Mentora</FeaturesTitle>
          <FeatureGrid>
            {FEATURES.map(({ icon: Icon, label }) => (
              <FeatureItem key={label}>
                <FeatureIconBox aria-hidden>
                  <Icon size={MARKETING.FEATURE_ICON_GLYPH_SIZE} strokeWidth={ICON_STROKE.MEDIUM} />
                </FeatureIconBox>
                <FeatureText>{label}</FeatureText>
              </FeatureItem>
            ))}
          </FeatureGrid>
        </FeaturesPanel>
      </Hero>

      <Footer>&copy; {new Date().getFullYear()} Mentora. All rights reserved.</Footer>
    </Main>
  );
}
