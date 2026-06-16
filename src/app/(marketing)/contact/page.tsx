import type { Metadata } from "next";
import { MarketingContactPage } from "@/components/features/marketing/MarketingContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Mentora team for support, partnerships, or school pricing.",
};

export default function ContactPage() {
  return <MarketingContactPage />;
}
