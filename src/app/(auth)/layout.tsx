import { AuthLayoutShell } from "./LayoutShell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutShell>{children}</AuthLayoutShell>;
}
