import type { Metadata } from "next";
import { MarketingLegalPage } from "@/components/features/marketing/MarketingLegalPage";
import { MARKETING_PRIVACY } from "@/constants/marketingLegalContent";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Mentora privacy policy.",
};

export default function PrivacyPage() {
  return (
    <MarketingLegalPage
      title={MARKETING_PRIVACY.title}
      lead={MARKETING_PRIVACY.lead}
      sections={MARKETING_PRIVACY.sections}
    />
  );
}
