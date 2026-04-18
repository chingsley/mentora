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

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  await requireRole("ADMIN");
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { region: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">Users</h1>
        <p className="text-sm text-muted-foreground">
          Showing the {users.length} most recent account{users.length === 1 ? "" : "s"}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All accounts</CardTitle>
          <CardDescription>
            Admins, teachers, students, and guardians registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Region</th>
                  <th className="py-2 pr-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2 pr-4 font-medium text-header">{u.name}</td>
                    <td className="py-2 pr-4 text-text/80">{u.email}</td>
                    <td className="py-2 pr-4">{u.role.toLowerCase()}</td>
                    <td className="py-2 pr-4">{u.region?.name ?? "—"}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {u.createdAt.toISOString().slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
