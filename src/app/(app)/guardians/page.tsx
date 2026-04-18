import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { listStudentGuardians } from "@/server/guardians";
import { InviteForm } from "./InviteForm";

export const metadata: Metadata = { title: "Guardians" };

export default async function GuardiansPage() {
  const session = await requireRole("STUDENT");
  const links = await listStudentGuardians(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">Guardians</h1>
        <p className="text-sm text-muted-foreground">
          Invite a parent or guardian via email. They&apos;ll get a link to sign up and view your
          records in read-only mode.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite a guardian</CardTitle>
          <CardDescription>
            They&apos;ll only see your attendance, grades, and active classes — no edit access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked guardians</CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <p className="text-sm text-muted-foreground">No guardians yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {links.map((l) => (
                <li key={l.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-header">{l.guardianEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {l.status.toLowerCase()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
