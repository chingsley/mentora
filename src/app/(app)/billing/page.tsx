import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { AppPageHeader } from "@/components/layouts/AppPageHeader";
import { PrimaryLink } from "@/components/ui/Link";
import { PageWrap } from "@/components/ui/primitives";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { StudentBillSection } from "@/components/features/student/dashboard/StudentBillSection";
import { getStudentBillSummary } from "@/server/studentBill";
import { getMyStudentProfile } from "@/server/students";

export const metadata: Metadata = { title: "My billing" };

export default async function StudentBillingPage() {
  const session = await requireRole("STUDENT");
  const [bill, profile] = await Promise.all([
    getStudentBillSummary(session.user.id),
    getMyStudentProfile(session.user.id),
  ]);

  if (!bill || !profile) {
    return (
      <PageWrap>
        <AppPageHeader title="My billing" subtitle="We couldn't load your billing summary." />
        <Card>
          <CardHeader>
            <CardTitle>Billing unavailable</CardTitle>
            <CardDescription>
              Try completing your student profile, then return to this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrimaryLink href="/profile">Go to profile</PrimaryLink>
          </CardContent>
        </Card>
      </PageWrap>
    );
  }

  const subtitle =
    bill.totalSessions > 0
      ? `${bill.totalAmountFormatted} across ${bill.totalSessions} completed session${bill.totalSessions === 1 ? "" : "s"}.`
      : "Completed sessions are billed at each subject's rate.";

  return (
    <PageWrap>
      <AppPageHeader
        title="My billing"
        subtitle={subtitle}
        profileImage={profile.user.image}
      />
      <StudentBillSection bill={bill} />
    </PageWrap>
  );
}
