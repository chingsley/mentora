"use client";

import { AppPageHeader } from "@/components/layouts/AppPageHeader";
import type { TeacherDashboardClassRow } from "@/types/teacherDashboard";
import { TeacherAddClassAction, type TeacherAddClassActionProps } from "./TeacherAddClassAction";
import { TeacherClassesTableCard } from "./TeacherClassesTableCard";

export interface TeacherMyClassesClientProps {
  rows: TeacherDashboardClassRow[];
  subtitle: string;
  profileImage: string | null;
  offeringDialog: TeacherAddClassActionProps;
}

export function TeacherMyClassesClient({
  rows,
  subtitle,
  profileImage,
  offeringDialog,
}: TeacherMyClassesClientProps) {
  return (
    <>
      <AppPageHeader
        title="My classes"
        subtitle={subtitle}
        profileImage={profileImage}
        action={<TeacherAddClassAction {...offeringDialog} />}
      />
      <TeacherClassesTableCard rows={rows} />
    </>
  );
}
