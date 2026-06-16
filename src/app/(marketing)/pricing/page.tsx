import type { Metadata } from "next";
import { MarketingPricingPage } from "@/components/features/marketing/MarketingPricingPage";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for students, teachers, and guardians on Mentora.",
};

export default function PricingPage() {
  return <MarketingPricingPage />;
}
