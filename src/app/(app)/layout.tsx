import { requireSession } from "@/lib/auth";
import { AppShell } from "@/components/layouts/AppShell";

export default async function AppAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return <AppShell user={session.user}>{children}</AppShell>;
}
