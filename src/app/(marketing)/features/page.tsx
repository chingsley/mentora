import type { Metadata } from "next";
import { MarketingFeaturesPage } from "@/components/features/marketing/MarketingFeaturesPage";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore Mentora features for students, teachers, and guardians.",
};

export default function FeaturesPage() {
  return <MarketingFeaturesPage />;
}
