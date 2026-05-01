import type { DayOfWeek } from "@prisma/client";

import type { TeacherProfileTabId } from "./teacherProfileTabIds";

export interface TeacherProfileChecklistItem {
  label: string;
  done: boolean;
  editTab?: TeacherProfileTabId;
}

export interface TeacherProfileInitialSubject {
  subjectId: string;
  defaultCap: number | null;
  courseDescription: string;
  gradeLevel: string;
  syllabus: string;
}

export interface TeacherProfileScheduleOffering {
  id: string;
  title: string;
  description: string | null;
  subjectId: string;
  subjectName: string;
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
  teacherCap: number;
  enrolled: number;
}

export interface TeacherProfileTabsProps {
  fullName: string;
  initials: string;
  imageUrl: string | null;
  displayId: string;
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
  timeZone: string;
  spokenLanguages: string;
  locationLabel: string;
  payoutLegalName: string | null;
  payoutCountryCode: string | null;
  payoutPreferredMethod: string | null;
  payoutNotes: string | null;
  allSubjects: { id: string; name: string }[];
  initialSubjects: TeacherProfileInitialSubject[];
  taughtSubjects: { id: string; name: string; defaultCap: number | null }[];
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
}
