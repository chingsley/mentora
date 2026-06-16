import type { Metadata } from "next";
import { MarketingAboutPage } from "@/components/features/marketing/MarketingAboutPage";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Mentora's mission to make quality tutoring accessible.",
};

export default function AboutPage() {
  return <MarketingAboutPage />;
}
