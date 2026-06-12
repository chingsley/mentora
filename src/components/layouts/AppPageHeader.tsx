"use client";

import { TeacherDashboardHeader } from "@/components/features/teacher/dashboard/TeacherDashboardHeader";
import { useAppShell } from "@/components/layouts/AppShellContext";
import { appShellProfileRole, appShellSearchPlaceholder } from "@/lib/appShellHeader";
import type { ReactNode } from "react";

export interface AppPageHeaderProps {
  title: string;
  subtitle?: string | null;
  searchPlaceholder?: string;
  profileImage?: string | null;
  profileDisplayName?: string;
  showProfileLink?: boolean;
  /** When true, shows search, notifications, and profile chip in the header. Default false. */
  showToolbar?: boolean;
  notificationCount?: number;
  /** Optional control aligned to the right of the title block. */
  action?: ReactNode;
}

export function AppPageHeader({
  title,
  subtitle,
  searchPlaceholder,
  profileImage = null,
  profileDisplayName,
  showProfileLink = true,
  showToolbar = false,
  notificationCount = 0,
  action,
}: AppPageHeaderProps) {
  const user = useAppShell();

  return (
    <TeacherDashboardHeader
      teacherName={profileDisplayName ?? user.name ?? "Friend"}
      teacherImage={profileImage}
      title={title}
      subtitle={subtitle}
      action={action}
      searchPlaceholder={searchPlaceholder ?? appShellSearchPlaceholder(user.role)}
      showProfileLink={showProfileLink}
      showToolbar={showToolbar}
      profileRole={appShellProfileRole(user.role)}
      notificationCount={notificationCount}
    />
  );
}
