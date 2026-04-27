import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Muted, PageHeader, PageTitle, PageWrap } from "@/components/ui/primitives";
import {
  listReportsForAdmin,
  REPORT_REASON_LABELS,
} from "@/server/teacherReports";
import { ReportsList } from "./ReportsList";

export const metadata: Metadata = { title: "Teacher reports" };

export default async function AdminReportsPage() {
  await requireRole("ADMIN");
  const reports = await listReportsForAdmin();

  return (
    <PageWrap>
      <PageHeader>
        <PageTitle>Teacher reports</PageTitle>
        <Muted>
          Reports from students and guardians. Visible to admins only.
        </Muted>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>All reports</CardTitle>
          <CardDescription>
            {reports.length} report{reports.length === 1 ? "" : "s"} received.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <Muted>No reports yet.</Muted>
          ) : (
            <ReportsList
              reports={reports.map((r) => ({
                id: r.id,
                teacherName: r.teacherProfile.user.name,
                teacherEmail: r.teacherProfile.user.email,
                reasonLabel: REPORT_REASON_LABELS[r.reason],
                status: r.status,
                createdAtLabel: r.createdAt.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
                description: r.description,
                reporterRole: r.reporterRole,
              }))}
            />
          )}
        </CardContent>
      </Card>
    </PageWrap>
  );
}
