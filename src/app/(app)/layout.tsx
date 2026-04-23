import { requireSession } from "@/lib/auth";
import { AppShell } from "@/components/layouts/AppShell";
import { ToastProvider } from "@/components/ui/Toast";
import { StudentRemindersHost } from "@/components/features/student/StudentRemindersHost";
import { listGuardianWards } from "@/server/guardians";

export default async function AppAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const showReminders = session.user.role === "STUDENT" || session.user.role === "GUARDIAN";
  const displayName = session.user.name ?? "Friend";

  const wards =
    session.user.role === "GUARDIAN" ? await listGuardianWards(session.user.id) : undefined;

  return (
    <ToastProvider>
      <AppShell user={session.user} wards={wards}>
        {children}
      </AppShell>
      {showReminders ? <StudentRemindersHost studentName={displayName} /> : null}
    </ToastProvider>
  );
}
