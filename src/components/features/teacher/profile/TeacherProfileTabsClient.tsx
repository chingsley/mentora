"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import styled, { css } from "styled-components";
import { AppPageHeader } from "@/components/layouts/AppPageHeader";
import { PageWrap } from "@/components/ui/primitives";
import { TeacherProfileCoursesTab } from "./TeacherProfileCoursesTab";
import { TeacherProfilePaymentTab } from "./TeacherProfilePaymentTab";
import { TeacherProfileScheduleTab } from "./TeacherProfileScheduleTab";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";
import { TeacherProfileViewTab } from "./TeacherProfileViewTab";
import {
  isTeacherProfileMaintenanceTabId,
  isTeacherProfileTabId,
  nextTabAfterSave,
  previousTabBefore,
  TEACHER_PROFILE_MAINTENANCE_TABS,
  TEACHER_PROFILE_TAB_LABEL,
  normalizeTeacherProfileTabParam,
} from "./teacherProfileTabIds";
import type { TeacherProfileTabId } from "./teacherProfileTabIds";

const TAB_LABEL: Record<TeacherProfileTabId, string> = {
  view: "Profile View",
  ...TEACHER_PROFILE_TAB_LABEL,
};

const Shell = styled(PageWrap)<{ $flushTop?: boolean }>`
  width: 100%;
  max-width: 88rem;

  ${(p) =>
    p.$flushTop &&
    css`
      gap: 0;
    `}
`;

const Toolbar = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  border-bottom: 1px solid ${COLORS.BORDER};
`;

function resolveTab(
  urlTab: string | null,
  initialTab: string | null | undefined,
  maintenanceMode: boolean,
): TeacherProfileTabId {
  const normalizedUrl = normalizeTeacherProfileTabParam(urlTab);
  const normalizedInitial = normalizeTeacherProfileTabParam(initialTab ?? null);

  if (maintenanceMode) {
    if (normalizedUrl && isTeacherProfileMaintenanceTabId(normalizedUrl)) return normalizedUrl;
    if (normalizedInitial && isTeacherProfileMaintenanceTabId(normalizedInitial)) {
      return normalizedInitial;
    }
    return "view";
  }
  if (normalizedUrl && isTeacherProfileTabId(normalizedUrl)) return normalizedUrl;
  if (normalizedInitial && isTeacherProfileTabId(normalizedInitial)) return normalizedInitial;
  return "view";
}

function TabsFallback() {
  return (
    <p style={{ fontSize: FONTS.SIZE.SM, color: COLORS.MUTED_FOREGROUND, margin: 0 }}>
      Loading profile…
    </p>
  );
}

function TeacherProfileTabsClientInner({
  initialTab,
  maintenanceMode = false,
  ...props
}: TeacherProfileTabsProps & { initialTab?: string | null; maintenanceMode?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlTab = params.get("tab");
  const profileSection = params.get("profileSection");
  const tab = resolveTab(urlTab, initialTab ?? null, maintenanceMode);
  const isProfileViewTab = tab === "view";
  const visibleTabIds = maintenanceMode
    ? [...TEACHER_PROFILE_MAINTENANCE_TABS]
    : (Object.keys(TAB_LABEL) as TeacherProfileTabId[]);
  const showTabToolbar = visibleTabIds.length > 1;

  const setTab = React.useCallback(
    (next: string, nextProfileSection?: string) => {
      const v: TeacherProfileTabId = isTeacherProfileTabId(next) ? next : "view";
      if (maintenanceMode && !isTeacherProfileMaintenanceTabId(v)) return;
      const search = new URLSearchParams(params.toString());
      search.set("tab", v);
      if (nextProfileSection) {
        search.set("profileSection", nextProfileSection);
      } else {
        search.delete("profileSection");
      }
      router.replace(`${pathname}?${search.toString()}`, { scroll: false });
    },
    [maintenanceMode, params, pathname, router],
  );

  React.useEffect(() => {
    if (!maintenanceMode) return;
    if (!isTeacherProfileMaintenanceTabId(tab)) {
      router.replace(`${pathname}?tab=view`, { scroll: false });
    }
  }, [maintenanceMode, pathname, router, tab]);

  return (
    <Shell $flushTop={isProfileViewTab}>
      {!isProfileViewTab ? (
        <AppPageHeader
          title="Teacher Profile"
          compact
          profileImage={props.imageUrl}
          profileDisplayName={props.fullName}
          searchPlaceholder="Search students, classes, messages..."
        />
      ) : null}

      <Tabs value={tab} onValueChange={setTab} variant="underline">
        {showTabToolbar ? (
          <Toolbar>
            <TabsList aria-label="Teacher profile sections">
              {visibleTabIds.map((id) => (
                <TabsTrigger key={id} value={id}>
                  {TAB_LABEL[id]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Toolbar>
        ) : null}

        <TabsContent value="view">
          <TeacherProfileViewTab
            fullName={props.fullName}
            initials={props.initials}
            imageUrl={props.imageUrl}
            headline={props.headline}
            bio={props.bio}
            rating={props.rating}
            ratingsCount={props.ratingsCount}
            spokenLanguages={props.spokenLanguages}
            locationCountryCode={props.locationCountryCode}
            locationCity={props.locationCity}
            locationLabel={props.locationLabel}
            taughtSubjects={props.taughtSubjects}
            initialSubjects={props.initialSubjects}
            checklist={props.checklist}
            email={props.email}
            displayId={props.displayId}
            workExperiences={props.workExperiences}
            profileSection={profileSection}
            onNavigateTab={setTab}
          />
        </TabsContent>

        {!maintenanceMode ? (
          <>
            <TabsContent value="courses">
              <TeacherProfileCoursesTab
                allSubjects={props.allSubjects}
                initialSubjects={props.initialSubjects}
                taughtSubjects={props.taughtSubjects}
                taughtSubjectsWithStudents={props.taughtSubjectsWithStudents}
                globalCap={props.globalCap}
                rateRegions={props.rateRegions}
                rateCells={props.rateCells}
                teacherRegionCode={props.teacherRegionCode}
                onAdvance={() => setTab(nextTabAfterSave("courses"))}
                onBack={() => setTab(previousTabBefore("courses"))}
              />
            </TabsContent>

            <TabsContent value="schedule">
              <TeacherProfileScheduleTab
                scheduleOfferings={props.scheduleOfferings}
                dialogSubjects={props.dialogSubjects}
                inviteableStudents={props.inviteableStudents}
                globalCap={props.globalCap}
                billingCurrency={props.billingCurrency}
                regionMinHourlyMajor={props.regionMinHourlyMajor}
                rateRegions={props.rateRegions}
                rateCells={props.rateCells}
                teacherRegionCode={props.teacherRegionCode}
                onAdvance={() => setTab(nextTabAfterSave("schedule"))}
                onBack={() => setTab(previousTabBefore("schedule"))}
              />
            </TabsContent>

            <TabsContent value="payment">
              <TeacherProfilePaymentTab
                payoutLegalName={props.payoutLegalName}
                payoutCountryCode={props.payoutCountryCode}
                payoutPreferredMethod={props.payoutPreferredMethod}
                payoutBankName={props.payoutBankName}
                payoutBankBranch={props.payoutBankBranch}
                payoutBankAccountNumber={props.payoutBankAccountNumber}
                payoutBankRoutingNumber={props.payoutBankRoutingNumber}
                payoutNotes={props.payoutNotes}
                onAdvance={() => setTab(nextTabAfterSave("payment"))}
                onBack={() => setTab(previousTabBefore("payment"))}
              />
            </TabsContent>
          </>
        ) : null}
      </Tabs>
    </Shell>
  );
}

export function TeacherProfileTabsClient({
  initialTab,
  maintenanceMode = false,
  ...props
}: TeacherProfileTabsProps & { initialTab?: string | null; maintenanceMode?: boolean }) {
  return (
    <Suspense fallback={<TabsFallback />}>
      <TeacherProfileTabsClientInner
        initialTab={initialTab}
        maintenanceMode={maintenanceMode}
        {...props}
      />
    </Suspense>
  );
}
