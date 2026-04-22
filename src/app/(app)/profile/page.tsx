import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { StudentProfilePage } from "./StudentProfilePage";
import { TeacherProfilePage } from "./TeacherProfilePage";

export const metadata: Metadata = { title: "My profile" };

export default async function MyProfilePage() {
  const session = await requireSession();
  const { role, id } = session.user;

  if (role === "STUDENT") return <StudentProfilePage userId={id} />;
  if (role === "TEACHER") return <TeacherProfilePage userId={id} />;
  redirect("/dashboard");
}
