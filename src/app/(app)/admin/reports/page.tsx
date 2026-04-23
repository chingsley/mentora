import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  listReportsForAdmin,
  REPORT_REASON_LABELS,
} from "@/server/teacherReports";
import { ReportStatusForm } from "./ReportStatusForm";

export const metadata: Metadata = { title: "Teacher reports" };

export default async function AdminReportsPage() {
  await requireRole("ADMIN");
  const reports = await listReportsForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-header sm:text-3xl">Teacher reports</h1>
        <p className="text-sm text-muted-foreground">
          Reports from students and guardians. Visible to admins only.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All reports</CardTitle>
          <CardDescription>
            {reports.length} report{reports.length === 1 ? "" : "s"} received.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {reports.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-header">
                      {r.teacherProfile.user.name}
                    </span>
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                      {r.teacherProfile.user.email}
                    </span>
                    <span className="rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-[11px] text-rose-900">
                      {REPORT_REASON_LABELS[r.reason]}
                    </span>
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] uppercase text-muted-foreground">
                      {r.status.toLowerCase()}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {r.createdAt.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-text/80">{r.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Reported by {r.reporterRole.toLowerCase()}
                  </p>
                  <ReportStatusForm reportId={r.id} currentStatus={r.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
