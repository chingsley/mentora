"use client";

import Link from "next/link";
import styled, { css } from "styled-components";
import { MarketingSecondaryCtaLink } from "@/components/ui/Link";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { SPACING } from "@/constants/spacing.constants";

export const MarketingPrimaryCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${MARKETING.CTA_MIN_HEIGHT};
  padding: 0 ${SPACING.SIX};
  border-radius: ${MARKETING.CTA_RADIUS};
  background-color: ${MARKETING.CTA_PRIMARY_BG};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${MARKETING.CTA_PRIMARY_TEXT};
  text-decoration: none;
  box-shadow: ${COLORS.ACTION_PRIMARY_SHADOW_MD};
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background-color: ${MARKETING.CTA_PRIMARY_BG_HOVER};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_45};
    outline-offset: 2px;
  }
`;

export const MarketingInverseCta = styled(MarketingPrimaryCta)`
  background-color: ${COLORS.WHITE};
  color: ${COLORS.ACTION_PRIMARY};
  box-shadow: none;

  &:hover {
    background-color: ${COLORS.SURFACE_OFF_WHITE};
    color: ${COLORS.ACTION_PRIMARY_HOVER};
  }
`;

export const MarketingOutlineCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${MARKETING.CTA_MIN_HEIGHT};
  padding: 0 ${SPACING.SIX};
  border-radius: ${MARKETING.CTA_RADIUS};
  border: 1px solid ${MARKETING.CTA_SECONDARY_BORDER};
  background-color: ${MARKETING.CTA_SECONDARY_BG};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${MARKETING.CTA_SECONDARY_TEXT};
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background-color: ${MARKETING.CTA_SECONDARY_BG_HOVER};
    border-color: ${COLORS.MARKETING_BORDER_STRONG};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.ACTION_PRIMARY_RING_28};
    outline-offset: 2px;
  }
`;

export const MarketingCtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.THREE};
`;

export function MarketingRoleCtaRow() {
  return (
    <MarketingCtaRow>
      <MarketingPrimaryCta href="/register?role=STUDENT">I&apos;m a student</MarketingPrimaryCta>
      <MarketingSecondaryCtaLink href="/register?role=TEACHER">I&apos;m a teacher</MarketingSecondaryCtaLink>
      <MarketingSecondaryCtaLink href="/register?role=GUARDIAN">I&apos;m a guardian</MarketingSecondaryCtaLink>
    </MarketingCtaRow>
  );
}

export const MarketingEyebrow = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  text-transform: uppercase;
  color: ${COLORS.ACTION_PRIMARY};
`;

export const MarketingDisplayTitle = styled.h1`
  margin: 0;
  font-size: ${FONTS.SIZE.HERO};
  font-weight: ${FONTS.WEIGHT.BOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.HERO};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE.MARKETING_HERO};
  }
`;

export const MarketingDisplayTitleAccent = styled.span`
  color: ${COLORS.ACTION_PRIMARY};
`;

export const MarketingDisplayLead = styled.p`
  margin: 0;
  max-width: ${MARKETING.PAGE_LEAD_MAX_WIDTH};
  font-size: ${FONTS.SIZE.MD};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE.LG};
  }
`;

export const MarketingSectionTitle = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.CARD_TITLE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};
`;

export const MarketingSectionLead = styled.p`
  margin: ${SPACING.FOUR} 0 0;
  max-width: ${MARKETING.PAGE_LEAD_MAX_WIDTH};
  font-size: ${FONTS.SIZE.MD};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};
`;

export const MarketingSectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  margin-bottom: ${MARKETING.SECTION_GAP};
  max-width: ${MARKETING.PAGE_TITLE_MAX_WIDTH};
`;

export const MarketingPageSection = styled.section`
  margin: 0 auto;
  max-width: ${MARKETING.MAX_WIDTH};
  padding: ${MARKETING.PAGE_PADDING_BLOCK} ${MARKETING.PAGE_PADDING_INLINE};
`;

export const MarketingPageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  margin-bottom: ${MARKETING.SECTION_GAP};
  max-width: ${MARKETING.PAGE_TITLE_MAX_WIDTH};
`;

export const MarketingPageTitle = styled.h1`
  margin: 0;
  font-size: ${FONTS.SIZE.H1};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${COLORS.MARKETING_TEXT_PRIMARY};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE.CARD_TITLE};
  }
`;

export const MarketingPageLead = styled.p`
  margin: 0;
  max-width: ${MARKETING.PAGE_LEAD_MAX_WIDTH};
  font-size: ${FONTS.SIZE.MD};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_TEXT_SECONDARY};

  ${LAYOUT.MEDIA.SM} {
    font-size: ${FONTS.SIZE.LG};
  }
`;

export const MarketingCard = styled.div`
  background-color: ${COLORS.FOREGROUND};
  border: 1px solid ${COLORS.MARKETING_CARD_BORDER};
  border-radius: ${MARKETING.CARD_RADIUS};
  box-shadow: ${MARKETING.CARD_SHADOW};
  padding: ${MARKETING.CARD_PADDING};
`;

export const MarketingPanel = MarketingCard;

export const MarketingStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${MARKETING.SECTION_GAP};
`;

export const MarketingAltSection = styled.section`
  background-color: ${COLORS.SURFACE_OFF_WHITE};
  border-block: 1px solid ${COLORS.MARKETING_BORDER};
`;

export const MarketingAltSectionInner = styled.div`
  margin: 0 auto;
  max-width: ${MARKETING.MAX_WIDTH};
  padding: ${MARKETING.PAGE_PADDING_BLOCK} ${MARKETING.PAGE_PADDING_INLINE};
`;

export const marketingInverseSectionStyles = css`
  background-color: ${COLORS.MARKETING_INVERSE_BG};
  color: ${COLORS.MARKETING_INVERSE_TEXT};
`;

export const MarketingInverseSection = styled.section`
  ${marketingInverseSectionStyles}
`;

export const MarketingInverseSectionInner = styled.div`
  margin: 0 auto;
  max-width: ${MARKETING.MAX_WIDTH};
  padding: ${MARKETING.INVERSE_SECTION_PADDING} ${MARKETING.PAGE_PADDING_INLINE};
`;

export const MarketingInverseTitle = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.CARD_TITLE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  line-height: ${FONTS.LINE_HEIGHT.TIGHT};
  color: ${COLORS.MARKETING_INVERSE_TEXT};
`;

export const MarketingInverseLead = styled.p`
  margin: ${SPACING.FOUR} 0 0;
  max-width: ${MARKETING.PAGE_LEAD_MAX_WIDTH};
  font-size: ${FONTS.SIZE.MD};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_INVERSE_TEXT_MUTED};
`;

export const MarketingGridTwo = styled.div`
  display: grid;
  gap: ${MARKETING.FEATURES_GRID_GAP};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.MD} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const MarketingGridThree = styled.div`
  display: grid;
  gap: ${MARKETING.FEATURES_GRID_GAP};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.MD} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

export const MarketingInverseOutlineCta = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${MARKETING.CTA_MIN_HEIGHT};
  padding: 0 ${SPACING.SIX};
  border-radius: ${MARKETING.CTA_RADIUS};
  border: 1px solid ${COLORS.MARKETING_INVERSE_BORDER};
  background-color: transparent;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MARKETING_INVERSE_TEXT};
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background-color: ${COLORS.MARKETING_INVERSE_BORDER};
    border-color: ${COLORS.MARKETING_INVERSE_TEXT_SUBTLE};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.MARKETING_INVERSE_TEXT_MUTED};
    outline-offset: 2px;
  }
`;

export const MarketingGridFour = styled.div`
  display: grid;
  gap: ${MARKETING.FEATURES_GRID_GAP};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
