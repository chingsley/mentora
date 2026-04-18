import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { getTeacherById } from "@/server/teachers";
import { getPolicy } from "@/server/policies";
import { computeCapacity } from "@/lib/capacity";
import { formatPrice } from "@/lib/time";
import { EnrollForm } from "./EnrollForm";

export const metadata: Metadata = { title: "Teacher profile" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeacherPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const [teacher, policy] = await Promise.all([getTeacherById(id), getPolicy()]);
  if (!teacher) notFound();

  const periods = teacher.offerings.map((o) => {
    const cap = computeCapacity({
      globalClassCap: policy.globalClassCap,
      teacherCap: o.teacherCap,
      currentEnrolled: o.enrollments.length,
    });
    return {
      id: o.id,
      subjectName: o.subject.name,
      dayOfWeek: o.dayOfWeek,
      startMinutes: o.startMinutes,
      endMinutes: o.endMinutes,
      effectiveCap: cap.effectiveCap,
      enrolled: o.enrollments.length,
      isFull: cap.isFull,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">
          {teacher.user.name}
        </h1>
        <p className="text-sm text-muted-foreground">{teacher.headline}</p>
        <div className="flex flex-wrap gap-2">
          {teacher.subjects.map((s) => (
            <span
              key={s.subject.id}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text/80"
            >
              {s.subject.name}
            </span>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pick your class periods</CardTitle>
            <CardDescription>
              Select the recurring weekly times you want to attend. Full periods are disabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnrollForm
              teacherId={teacher.id}
              periods={periods}
              canEnroll={session.user.role === "STUDENT"}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-text/80">
                {teacher.bio || "This teacher hasn't written a bio yet."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rates</CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.rates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rates set yet.</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {teacher.rates.map((r) => (
                    <li key={r.id} className="flex items-center justify-between">
                      <span className="text-text/80">
                        {r.subject.name} &middot; {r.region.name}
                      </span>
                      <span className="font-medium text-header">
                        {formatPrice(r.hourlyRate, r.region.currency)}/hr
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
