import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { findGuardianStudent } from "@/server/guardians";
import { WardSubNav } from "./WardSubNav";

interface Props {
  children: React.ReactNode;
  params: Promise<{ studentId: string }>;
}

export default async function WardLayout({ children, params }: Props) {
  const session = await requireRole("GUARDIAN");
  const { studentId } = await params;
  const link = await findGuardianStudent(session.user.id, studentId);
  if (!link) notFound();

  return (
    <div className="flex flex-col gap-4">
      <WardSubNav studentId={studentId} />
      {children}
    </div>
  );
}
