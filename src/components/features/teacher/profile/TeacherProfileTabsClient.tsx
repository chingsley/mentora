"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";
import styled from "styled-components";
import { PageWrap } from "@/components/ui/primitives";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";
import { TeacherProfileViewTab } from "./TeacherProfileViewTab";

const Shell = styled(PageWrap)`
  width: 100%;
  max-width: 88rem;
  gap: 0;
`;

function TabsFallback() {
  return null;
}

function TeacherProfileTabsClientInner(props: TeacherProfileTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const profileSection = params.get("profileSection");

  const navigateProfileSection = React.useCallback(
    (section: string) => {
      const search = new URLSearchParams(params.toString());
      search.delete("setup");
      search.delete("welcome");
      search.delete("tab");
      search.set("profileSection", section);
      router.replace(`${pathname}?${search.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  return (
    <Shell>
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
        taughtSubjectsWithStudents={props.taughtSubjectsWithStudents}
        globalCap={props.globalCap}
        checklist={props.checklist}
        email={props.email}
        contactPhone={props.contactPhone}
        contactAddress={props.contactAddress}
        displayId={props.displayId}
        scheduleOfferings={props.scheduleOfferings}
        dialogSubjects={props.dialogSubjects}
        inviteableStudents={props.inviteableStudents}
        billingCurrency={props.billingCurrency}
        regionMinHourlyMajor={props.regionMinHourlyMajor}
        rateRegions={props.rateRegions}
        rateCells={props.rateCells}
        teacherRegionCode={props.teacherRegionCode}
        workExperiences={props.workExperiences}
        testimonials={props.testimonials}
        reviewsCount={props.reviewsCount}
        profileSection={profileSection}
        flushChromeToMainTop
        onNavigateProfileSection={navigateProfileSection}
      />
    </Shell>
  );
}

export function TeacherProfileTabsClient(props: TeacherProfileTabsProps) {
  return (
    <Suspense fallback={<TabsFallback />}>
      <TeacherProfileTabsClientInner {...props} />
    </Suspense>
  );
}
