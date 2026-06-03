import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { getClassroomView } from "@/server/classSession";
import { ClassroomClient } from "./ClassroomClient";

export const metadata: Metadata = { title: "Classroom" };

interface Props {
  params: Promise<{ offeringId: string }>;
}

export default async function ClassroomPage({ params }: Props) {
  const { offeringId } = await params;
  const session = await requireSession();
  const view = await getClassroomView(
    session.user.id,
    session.user.role,
    offeringId,
  );

  return <ClassroomClient view={view} />;
}
