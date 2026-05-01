import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { StudentProfilePage } from "./StudentProfilePage";
import { TeacherProfilePage } from "./TeacherProfilePage";

export const metadata: Metadata = { title: "My profile" };

export default async function MyProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const { role, id } = session.user;
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" ? sp.tab : null;

  if (role === "STUDENT") return <StudentProfilePage userId={id} />;
  if (role === "TEACHER") return <TeacherProfilePage userId={id} initialTab={tab} />;
  redirect("/dashboard");
}
