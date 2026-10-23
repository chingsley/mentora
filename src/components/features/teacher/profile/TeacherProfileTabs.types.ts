import type { DayOfWeek, OfferingPeriodType, OfferingRecurrenceKind } from "@prisma/client";

import type { TeacherPublicProfileWorkExperience } from "@/types/teacherPublicProfileWorkExperience";

import type { TeacherProfileTabId } from "./teacherProfileTabIds";

export interface TeacherProfileChecklistItem {
  label: string;
  done: boolean;
  editTab?: TeacherProfileTabId;
  /** Inner tab on Profile View (`TeacherPublicProfileView`). */
  profileSection?: string;
}

export interface TeacherProfileInitialSubject {
  subjectId: string;
  defaultCap: number | null;
  courseDescription: string;
  gradeLevel: string;
  yearsTaught: number;
  syllabus: string;
}

export interface TeacherProfileScheduleOffering {
  id: string;
  title: string;
  description: string | null;
  subjectId: string;
  subjectName: string;
  scheduleGroupId: string | null;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  periodType: OfferingPeriodType;
  teacherCap: number;
  hourlyRate: number;
  enrolled: number;
  invitedStudentProfileIds: string[];
  recurrenceKind: OfferingRecurrenceKind;
  recurrenceAnchorDate: Date | null;
  recurrenceOrdinal: number | null;
  createdAt: Date;
}

export interface TeacherProfileInviteableStudent {
  id: string;
  name: string;
  email: string;
}

export interface TeacherProfileTabsProps {
  fullName: string;
  initials: string;
  imageUrl: string | null;
  displayId: string;
  email: string;
  profileCompleted: boolean;
  headline: string;
  bio: string;
  rating: number;
  ratingsCount: number;
  hoursTaught: number;
  offeringCount: number;
  activeStudentCount: number;
  globalCap: number;
  checklist: TeacherProfileChecklistItem[];
  teacherRegionName: string;
  teacherRegionCode: string | null;
  timeZone: string;
  spokenLanguages: string;
  locationCountryCode: string;
  locationCity: string;
  locationLabel: string;
  initialSubjects: TeacherProfileInitialSubject[];
  taughtSubjects: {
    id: string;
    name: string;
    defaultCap: number | null;
    yearsTaught: number;
    tenureLabel: string;
  }[];
  taughtSubjectsWithStudents: {
    subjectId: string;
    subjectName: string;
    defaultCap: number | null;
    studentCount: number;
  }[];
  rateRegions: {
    id: string;
    code: string;
    name: string;
    currency: string;
    minMajor: number;
  }[];
  rateCells: { subjectId: string; regionCode: string; hourlyMajor: number }[];
  rateRows: { id: string; subjectName: string; regionName: string; hourlyDisplay: string }[];
  dialogSubjects: { id: string; name: string; defaultCap: number }[];
  scheduleOfferings: TeacherProfileScheduleOffering[];
  inviteableStudents: TeacherProfileInviteableStudent[];
  billingCurrency: string;
  regionMinHourlyMajor: number | null;
  workExperiences: TeacherPublicProfileWorkExperience[];
}
