import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Muted, PageHeader, PageTitle, PageWrap } from "@/components/ui/primitives";
import { UsersTable } from "./UsersTable";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  await requireRole("ADMIN");
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { region: true },
  });

  return (
    <PageWrap>
      <PageHeader>
        <PageTitle>Users</PageTitle>
        <Muted>
          Showing the {users.length} most recent account
          {users.length === 1 ? "" : "s"}.
        </Muted>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>All accounts</CardTitle>
          <CardDescription>
            Admins, teachers, students, and guardians registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              regionName: u.region?.name ?? null,
              joinedDate: u.createdAt.toISOString().slice(0, 10),
            }))}
          />
        </CardContent>
      </Card>
    </PageWrap>
  );
}
