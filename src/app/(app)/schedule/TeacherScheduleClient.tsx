"use client";

import {
  TeacherOfferingCalendar,
  type TeacherOfferingCalendarOffering,
} from "@/components/features/teacher/TeacherOfferingCalendar";
import type { OfferingDialogSubject } from "@/components/features/teacher/OfferingDialog";
import type { OfferingInviteableStudent } from "@/components/features/teacher/OfferingStudentInviteField";

export type TeacherScheduleOffering = TeacherOfferingCalendarOffering;

export interface TeacherScheduleClientProps {
  offerings: TeacherScheduleOffering[];
  subjects: OfferingDialogSubject[];
  inviteableStudents: OfferingInviteableStudent[];
  globalCap: number;
}

export function TeacherScheduleClient({
  offerings,
  subjects,
  inviteableStudents,
  globalCap,
}: TeacherScheduleClientProps) {
  return (
    <TeacherOfferingCalendar
      offerings={offerings}
      subjects={subjects}
      inviteableStudents={inviteableStudents}
      globalCap={globalCap}
      tileColorMode="capacity"
    />
  );
}
