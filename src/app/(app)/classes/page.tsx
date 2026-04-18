import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { listStudentEnrollments } from "@/server/enrollments";
import { DAY_LABEL, minutesToTime } from "@/lib/time";
import { dropAction } from "./actions";

export const metadata: Metadata = { title: "My classes" };

export default async function MyClassesPage() {
  const session = await requireRole("STUDENT");
  const enrollments = await listStudentEnrollments(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">My classes</h1>
        <p className="text-sm text-muted-foreground">
          Periods you&apos;re actively enrolled in.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No active classes</CardTitle>
            <CardDescription>
              Find a teacher and pick the periods that work for you.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3">
          {enrollments.map((e) => (
            <Card key={e.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-header">{e.offering.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.offering.subject.name} &middot; with {e.offering.teacherProfile.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {DAY_LABEL[e.offering.dayOfWeek]}{" "}
                    {minutesToTime(e.offering.startMinutes)}–{minutesToTime(e.offering.endMinutes)}
                  </p>
                </div>
                <form action={dropAction}>
                  <input type="hidden" name="enrollmentId" value={e.id} />
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center rounded-md border border-destructive/40 bg-foreground px-3 text-sm font-medium text-destructive hover:bg-destructive/5"
                  >
                    Drop
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
