"use client";

import Link from "next/link";
import styled from "styled-components";
import {
  MarketingCtaRow,
  MarketingInverseCta,
  MarketingInverseLead,
  MarketingInverseOutlineCta,
  MarketingInverseSection,
  MarketingInverseSectionInner,
  MarketingInverseTitle,
} from "@/components/features/marketing/marketingLayout";
import { SPACING } from "@/constants/spacing.constants";

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${SPACING.FIVE};
`;

export interface MarketingCtaBandProps {
  title: string;
  lead: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function MarketingCtaBand({
  title,
  lead,
  primaryHref = "/register",
  primaryLabel = "Sign up free",
  secondaryHref = "/contact",
  secondaryLabel = "Contact us",
}: MarketingCtaBandProps) {
  return (
    <MarketingInverseSection>
      <MarketingInverseSectionInner>
        <Stack>
          <MarketingInverseTitle>{title}</MarketingInverseTitle>
          <MarketingInverseLead>{lead}</MarketingInverseLead>
          <MarketingCtaRow>
            <MarketingInverseCta href={primaryHref}>{primaryLabel}</MarketingInverseCta>
            <MarketingInverseOutlineCta href={secondaryHref}>{secondaryLabel}</MarketingInverseOutlineCta>
          </MarketingCtaRow>
        </Stack>
      </MarketingInverseSectionInner>
    </MarketingInverseSection>
  );
}
