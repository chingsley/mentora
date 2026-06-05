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
import { TeacherEarningsSection } from "@/components/features/teacher/dashboard/TeacherEarningsSection";
import { getTeacherEarningsSummary } from "@/server/teacherEarnings";
import { getMyTeacherProfile } from "@/server/teachers";

export const metadata: Metadata = { title: "My earnings" };

export default async function TeacherEarningsPage() {
  const session = await requireRole("TEACHER");
  const [earnings, data] = await Promise.all([
    getTeacherEarningsSummary(session.user.id),
    getMyTeacherProfile(session.user.id),
  ]);

  if (!earnings || !data) {
    return (
      <PageWrap>
        <AppPageHeader title="My earnings" subtitle="We couldn't load your earnings summary." />
        <Card>
          <CardHeader>
            <CardTitle>Earnings unavailable</CardTitle>
            <CardDescription>
              Try completing your teacher profile, then return to this page.
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
    earnings.totalSessions > 0
      ? `${earnings.netAmountFormatted} net from ${earnings.totalSessions} billable session${earnings.totalSessions === 1 ? "" : "s"} (${earnings.commissionPercent}% platform fee).`
      : "Earnings from completed sessions at your subject rates.";

  return (
    <PageWrap>
      <AppPageHeader
        title="My earnings"
        subtitle={subtitle}
        profileImage={data.profile.user.image}
      />
      <TeacherEarningsSection earnings={earnings} />
    </PageWrap>
  );
}
