import type { Metadata } from "next";
import { MarketingHomePage } from "@/components/features/marketing/MarketingHomePage";

export const metadata: Metadata = {
  title: "Learn with great teachers",
  description:
    "Mentora connects students with vetted tutors. Search by subject, schedule classes, and join virtual classrooms in one click.",
};

export default function MarketingHomeRoute() {
  return <MarketingHomePage />;
}
