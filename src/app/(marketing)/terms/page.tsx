import type { Metadata } from "next";
import { MarketingLegalPage } from "@/components/features/marketing/MarketingLegalPage";
import { MARKETING_TERMS } from "@/constants/marketingLegalContent";

export const metadata: Metadata = {
  title: "Terms",
  description: "Mentora terms of service.",
};

export default function TermsPage() {
  return (
    <MarketingLegalPage
      title={MARKETING_TERMS.title}
      lead={MARKETING_TERMS.lead}
      sections={MARKETING_TERMS.sections}
    />
  );
}
