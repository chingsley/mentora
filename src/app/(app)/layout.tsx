import { requireSession } from "@/lib/auth";
import { AppShell } from "@/components/layouts/AppShell";
import { ToastProvider } from "@/components/ui/Toast";
import { StudentRemindersHost } from "@/components/features/student/StudentRemindersHost";

export default async function AppAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const isStudent = session.user.role === "STUDENT";
  const studentName = session.user.name ?? "Student";

  return (
    <ToastProvider>
      <AppShell user={session.user}>{children}</AppShell>
      {isStudent ? <StudentRemindersHost studentName={studentName} /> : null}
    </ToastProvider>
  );
}
