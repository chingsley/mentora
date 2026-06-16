import { MarketingSiteShell } from "@/components/features/marketing/MarketingSiteShell";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <MarketingSiteShell>{children}</MarketingSiteShell>;
}
