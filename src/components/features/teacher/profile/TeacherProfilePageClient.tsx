"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useAppRouter } from "@/hooks/useAppRouter";
import * as React from "react";
import { Suspense } from "react";
import { TeacherProfileTabsClient } from "./TeacherProfileTabsClient";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";
import {
  TEACHER_SETUP_QUERY_VALUE,
  TEACHER_WELCOME_QUERY_VALUE,
} from "./teacherProfileSetup.constants";
import { normalizeTeacherProfileTabParam } from "./teacherProfileTabIds";

export interface TeacherProfilePageClientProps extends TeacherProfileTabsProps {
  initialTab?: string | null;
}

function TeacherProfilePageClientInner({
  initialTab,
  ...props
}: TeacherProfilePageClientProps) {
  const router = useAppRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  React.useEffect(() => {
    const setup = params.get("setup") === TEACHER_SETUP_QUERY_VALUE;
    const welcome = params.get("welcome") === TEACHER_WELCOME_QUERY_VALUE;
    const legacyTab = normalizeTeacherProfileTabParam(params.get("tab"));
    if (!setup && !welcome && !legacyTab) return;

    const next = new URLSearchParams(params.toString());
    next.delete("setup");
    next.delete("welcome");
    next.delete("tab");

    if (legacyTab === "schedule") {
      next.set("profileSection", "schedule");
    } else if (legacyTab === "courses") {
      next.set("profileSection", "subjects");
    } else if (legacyTab === "view" && initialTab) {
      const section = normalizeTeacherProfileTabParam(initialTab);
      if (section === "schedule") next.set("profileSection", "schedule");
      if (section === "courses") next.set("profileSection", "subjects");
    }

    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [initialTab, params, pathname, router]);

  return <TeacherProfileTabsClient {...props} />;
}

export function TeacherProfilePageClient(props: TeacherProfilePageClientProps) {
  return (
    <Suspense fallback={null}>
      <TeacherProfilePageClientInner {...props} />
    </Suspense>
  );
}
