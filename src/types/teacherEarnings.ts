export interface TeacherEarningsSubject {
  subjectId: string;
  subjectName: string;
  rateMinor: number;
  rateFormatted: string;
  /** Billable student-session count (enrollment × held session). */
  sessionsCompleted: number;
  /** Unique held class sessions for this subject. */
  classesHeld: number;
  grossAmountMinor: number;
  grossAmountFormatted: string;
  netAmountMinor: number;
  netAmountFormatted: string;
  present: number;
  absent: number;
  late: number;
}

export interface TeacherEarningsSummary {
  currency: string;
  commissionPercent: number;
  subjects: TeacherEarningsSubject[];
  totalSubjects: number;
  totalSessions: number;
  totalClassesHeld: number;
  grossAmountMinor: number;
  grossAmountFormatted: string;
  commissionAmountMinor: number;
  commissionAmountFormatted: string;
  netAmountMinor: number;
  netAmountFormatted: string;
}
