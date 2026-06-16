"use client";

import Link from "next/link";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { MARKETING } from "@/constants/marketing.constants";
import { MARKETING_FOOTER } from "@/constants/marketingContent";
import { SPACING } from "@/constants/spacing.constants";

const Footer = styled.footer`
  border-top: 1px solid ${COLORS.MARKETING_INVERSE_BORDER};
  background-color: ${COLORS.MARKETING_INVERSE_BG};
  color: ${COLORS.MARKETING_INVERSE_TEXT};
`;

const Inner = styled.div`
  margin: 0 auto;
  max-width: ${MARKETING.MAX_WIDTH};
  padding: ${SPACING.TWELVE} ${MARKETING.PAGE_PADDING_INLINE};
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TEN};
`;

const TopRow = styled.div`
  display: grid;
  gap: ${SPACING.TEN};
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.MD} {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 2fr);
  }
`;

const BrandBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const BrandRow = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.THREE};
  text-decoration: none;
`;

const BrandMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${MARKETING.BRAND_MARK_SIZE};
  height: ${MARKETING.BRAND_MARK_SIZE};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.ACTION_PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${COLORS.WHITE};
`;

const BrandName = styled.span`
  font-size: ${FONTS.SIZE.BASE};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  color: ${COLORS.MARKETING_INVERSE_TEXT};
`;

const Tagline = styled.p`
  margin: 0;
  max-width: ${MARKETING.PAGE_LEAD_MAX_WIDTH};
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MARKETING_INVERSE_TEXT_MUTED};
`;

const LinkGrid = styled.div`
  display: grid;
  gap: ${SPACING.EIGHT};
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
`;

const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const ColumnTitle = styled.h2`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  letter-spacing: ${FONTS.LETTER_SPACING.TITLE};
  text-transform: uppercase;
  color: ${COLORS.MARKETING_INVERSE_TEXT_SUBTLE};
`;

const FooterLink = styled(Link)`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MARKETING_INVERSE_TEXT_MUTED};
  text-decoration: none;

  &:hover {
    color: ${COLORS.MARKETING_INVERSE_TEXT};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.MARKETING_INVERSE_TEXT_MUTED};
    outline-offset: 2px;
    border-radius: ${LAYOUT.RADIUS.MD};
  }
`;

const BottomRow = styled.p`
  margin: 0;
  padding-top: ${SPACING.SIX};
  border-top: 1px solid ${COLORS.MARKETING_INVERSE_BORDER};
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MARKETING_INVERSE_TEXT_SUBTLE};
`;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <Footer>
      <Inner>
        <TopRow>
          <BrandBlock>
            <BrandRow href="/">
              <BrandMark aria-hidden>M</BrandMark>
              <BrandName>Mentora</BrandName>
            </BrandRow>
            <Tagline>{MARKETING_FOOTER.tagline}</Tagline>
          </BrandBlock>
          <LinkGrid>
            {MARKETING_FOOTER.columns.map((column) => (
              <LinkColumn key={column.title}>
                <ColumnTitle>{column.title}</ColumnTitle>
                {column.links.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </LinkColumn>
            ))}
          </LinkGrid>
        </TopRow>
        <BottomRow>&copy; {year} Mentora. All rights reserved.</BottomRow>
      </Inner>
    </Footer>
  );
}
