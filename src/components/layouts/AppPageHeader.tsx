"use client";

import { TeacherDashboardHeader } from "@/components/features/teacher/dashboard/TeacherDashboardHeader";
import { useAppShell } from "@/components/layouts/AppShellContext";
import { appShellProfileRole, appShellSearchPlaceholder } from "@/lib/appShellHeader";

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
}: AppPageHeaderProps) {
  const user = useAppShell();

  return (
    <TeacherDashboardHeader
      teacherName={profileDisplayName ?? user.name ?? "Friend"}
      teacherImage={profileImage}
      title={title}
      subtitle={subtitle}
      searchPlaceholder={searchPlaceholder ?? appShellSearchPlaceholder(user.role)}
      showProfileLink={showProfileLink}
      showToolbar={showToolbar}
      profileRole={appShellProfileRole(user.role)}
      notificationCount={notificationCount}
    />
  );
}
