"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import styled from "styled-components";
import { TeacherDashboardHeader } from "@/components/features/teacher/dashboard/TeacherDashboardHeader";
import { formatTeacherProfileSubtitleName } from "@/lib/formatTeacherProfileSubtitleName";
import { TeacherProfileBioTab } from "./TeacherProfileBioTab";
import { TeacherProfileCoursesTab } from "./TeacherProfileCoursesTab";
import { TeacherProfilePaymentTab } from "./TeacherProfilePaymentTab";
import { TeacherProfileScheduleTab } from "./TeacherProfileScheduleTab";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";
import { TeacherProfileViewTab } from "./TeacherProfileViewTab";
import { isTeacherProfileTabId, nextTabAfterSave } from "./teacherProfileTabIds";
import type { TeacherProfileTabId } from "./teacherProfileTabIds";

const TAB_LABEL: Record<TeacherProfileTabId, string> = {
  view: "Profile View",
  bio: "Photo & Bio",
  courses: "Courses & Rates",
  schedule: "Scheduling",
  payment: "Payment Details",
};

const Shell = styled.div`
  display: flex;
  width: 100%;
  max-width: 88rem;
  flex-direction: column;
  gap: ${SPACING.FIVE};

  ${LAYOUT.MEDIA.LG} {
    margin-top: calc(${SPACING.FOUR} - ${LAYOUT.PAGE_INSET.BLOCK});
  }
`;

const Toolbar = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  border-bottom: 1px solid ${COLORS.BORDER};
`;

function resolveTab(urlTab: string | null, initialTab: string | null | undefined): TeacherProfileTabId {
  if (urlTab && isTeacherProfileTabId(urlTab)) return urlTab;
  if (initialTab && isTeacherProfileTabId(initialTab)) return initialTab;
  return "view";
}

function TabsFallback() {
  return (
    <p style={{ fontSize: FONTS.SIZE.SM, color: COLORS.MUTED_FOREGROUND, margin: 0 }}>
      Loading profile…
    </p>
  );
}

function TeacherProfileTabsInner({
  initialTab,
  ...props
}: TeacherProfileTabsProps & { initialTab?: string | null; }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlTab = params.get("tab");
  const tab = resolveTab(urlTab, initialTab ?? null);

  const setTab = React.useCallback(
    (next: string) => {
      const v: TeacherProfileTabId = isTeacherProfileTabId(next) ? next : "view";
      router.replace(`${pathname}?tab=${v}`, { scroll: false });
    },
    [pathname, router],
  );

  return (
    <Tabs value={tab} onValueChange={setTab} variant="underline">
      <Toolbar>
        <TabsList aria-label="Teacher profile sections">
          {(Object.keys(TAB_LABEL) as TeacherProfileTabId[]).map((id) => (
            <TabsTrigger key={id} value={id}>
              {TAB_LABEL[id]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Toolbar>

      <TabsContent value="view">
        <TeacherProfileViewTab
          fullName={props.fullName}
          initials={props.initials}
          imageUrl={props.imageUrl}
          displayId={props.displayId}
          profileCompleted={props.profileCompleted}
          headline={props.headline}
          bio={props.bio}
          rating={props.rating}
          ratingsCount={props.ratingsCount}
          hoursTaught={props.hoursTaught}
          offeringCount={props.offeringCount}
          activeStudentCount={props.activeStudentCount}
          checklist={props.checklist}
          teacherRegionName={props.teacherRegionName}
          timeZone={props.timeZone}
          spokenLanguages={props.spokenLanguages}
          locationLabel={props.locationLabel}
          taughtSubjects={props.taughtSubjects}
          rateRows={props.rateRows}
          payoutLegalName={props.payoutLegalName}
          payoutPreferredMethod={props.payoutPreferredMethod}
          onNavigateTab={setTab}
        />
      </TabsContent>

      <TabsContent value="bio">
        <TeacherProfileBioTab
          key={`${props.bio}|${props.spokenLanguages}|${props.imageUrl ?? ""}`}
          initials={props.initials}
          imageUrl={props.imageUrl}
          bio={props.bio}
          spokenLanguages={props.spokenLanguages}
          locationLabel={props.locationLabel}
          onAdvance={() => setTab(nextTabAfterSave("bio"))}
          onBack={() => setTab("view")}
        />
      </TabsContent>

      <TabsContent value="courses">
        <TeacherProfileCoursesTab
          allSubjects={props.allSubjects}
          initialSubjects={props.initialSubjects}
          taughtSubjects={props.taughtSubjects}
          taughtSubjectsWithStudents={props.taughtSubjectsWithStudents}
          globalCap={props.globalCap}
          rateRegions={props.rateRegions}
          rateCells={props.rateCells}
          onAdvance={() => setTab(nextTabAfterSave("courses"))}
        />
      </TabsContent>

      <TabsContent value="schedule">
        <TeacherProfileScheduleTab
          scheduleOfferings={props.scheduleOfferings}
          dialogSubjects={props.dialogSubjects}
          globalCap={props.globalCap}
        />
      </TabsContent>

      <TabsContent value="payment">
        <TeacherProfilePaymentTab
          payoutLegalName={props.payoutLegalName}
          payoutCountryCode={props.payoutCountryCode}
          payoutPreferredMethod={props.payoutPreferredMethod}
          payoutNotes={props.payoutNotes}
          onAdvance={() => setTab(nextTabAfterSave("payment"))}
        />
      </TabsContent>
    </Tabs>
  );
}

export function TeacherProfileTabsClient({
  initialTab,
  ...props
}: TeacherProfileTabsProps & { initialTab?: string | null; }) {
  return (
    <Shell>
      <TeacherDashboardHeader
        teacherName={props.fullName}
        teacherImage={props.imageUrl}
        title="Teacher Profile"
        subtitle={formatTeacherProfileSubtitleName(props.fullName)}
        searchPlaceholder="Search students, classes, messages..."
        showProfileLink={false}
      />
      <Suspense fallback={<TabsFallback />}>
        <TeacherProfileTabsInner initialTab={initialTab} {...props} />
      </Suspense>
    </Shell>
  );
}
