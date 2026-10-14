"use client";

import * as React from "react";
import styled from "styled-components";
import type { CalendarEntry } from "@/components/features/calendar/types";
import {
  ClassDetailsDialog,
  type ClassDetail,
} from "@/components/features/class/ClassDetailsDialog";
import { TeacherPublicProfileView } from "@/components/features/teacher/public/TeacherPublicProfileView";
import {
  TEACHER_PUBLIC_PROFILE,
  TEACHER_PUBLIC_PROFILE_SPACE,
} from "@/constants/teacherPublicProfile.constants";
import type { TeacherPublicProfileWorkExperience } from "@/types/teacherPublicProfileWorkExperience";
import type { Role } from "@prisma/client";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { SessionOccurrenceSnapshot } from "@/lib/sessionOccurrenceKey";
import type { StudentClassRow } from "@/types/studentClass";
import { TeacherDetailStudentSchedule } from "./TeacherDetailStudentSchedule";
import { TeacherPublicCalendar } from "./TeacherPublicCalendar";
import { TeacherRatesWithOfferings } from "./TeacherRatesWithOfferings";
import { useTeacherOfferingEnrollment } from "./useTeacherOfferingEnrollment";

const SectionTitle = styled.h2`
  margin: 0 0 ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.UI_LARGE};
  font-weight: ${FONTS.WEIGHT.BOLD};
  color: ${COLORS.HEADER};
`;

const InfoBlock = styled.p`
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.SURFACE_OFF_WHITE};
  padding: ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const AvailabilityStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.EIGHT};
`;

const EnrollRegion = styled.section`
  padding: ${SPACING.EIGHT} ${LAYOUT.PAGE_INSET.INLINE} ${TEACHER_PUBLIC_PROFILE_SPACE.BODY_PADDING_BLOCK};
  background-color: ${COLORS.FOREGROUND};
`;

const EnrollColumn = styled.div`
  margin: 0 auto;
  max-width: ${TEACHER_PUBLIC_PROFILE.CONTENT_MAX_WIDTH};
  width: 100%;
`;

export interface TeacherTestimonial {
  id: string;
  studentName: string;
  rating: number;
  body: string;
  offeringTitle: string;
}

export interface TeacherSubjectDetail {
  id: string;
  name: string;
  courseDescription: string;
  gradeLevel: string;
}

export interface TeacherRateRow {
  id: string;
  subjectId: string;
  subjectName: string;
  regionName: string;
  hourlyDisplay: string;
}

export interface TeacherDetailViewProps {
  name: string;
  imageUrl: string | null;
  initials: string;
  headline: string;
  bio: string;
  email: string;
  spokenLanguages: string;
  locationCountryCode: string;
  displayId: string;
  rating: number;
  ratingsCount: number;
  subjects: TeacherSubjectDetail[];
  rates: TeacherRateRow[];
  entries: CalendarEntry[];
  detailsByOfferingId: Record<string, ClassDetail>;
  enrollmentByOfferingId: Record<string, string>;
  viewerRole: Role;
  studentSchedule: {
    rows: StudentClassRow[];
    occurrenceMap: Record<string, SessionOccurrenceSnapshot>;
    studentDisplayName: string;
  } | null;
  testimonials: TeacherTestimonial[];
  workExperiences: TeacherPublicProfileWorkExperience[];
}

export function TeacherDetailView({
  name,
  imageUrl,
  initials,
  headline,
  bio,
  email,
  spokenLanguages,
  locationCountryCode,
  displayId,
  rating,
  ratingsCount,
  subjects,
  rates,
  entries,
  detailsByOfferingId,
  enrollmentByOfferingId,
  viewerRole,
  studentSchedule,
  testimonials,
  workExperiences,
}: TeacherDetailViewProps) {
  const isStudent = viewerRole === "STUDENT";
  const enrollment = useTeacherOfferingEnrollment();
  const [expandedSubjectId, setExpandedSubjectId] = React.useState<string | null>(null);

  const skills = subjects.map((s) => s.name);

  const toggleSubject = React.useCallback((subjectId: string) => {
    setExpandedSubjectId((prev) => (prev === subjectId ? null : subjectId));
  }, []);

  const selectedDetail = enrollment.selectedOfferingId
    ? detailsByOfferingId[enrollment.selectedOfferingId] ?? null
    : null;
  const selectedEnrollmentId = enrollment.selectedOfferingId
    ? enrollmentByOfferingId[enrollment.selectedOfferingId] ?? null
    : null;

  const availabilityPanel = (
    <AvailabilityStack>
      <TeacherRatesWithOfferings
        rates={rates}
        entries={entries}
        detailsByOfferingId={detailsByOfferingId}
        enrollmentByOfferingId={enrollmentByOfferingId}
        viewerRole={viewerRole}
        pendingOfferingId={enrollment.pendingOfferingId}
        expandedSubjectId={expandedSubjectId}
        onToggleSubject={toggleSubject}
        onOfferingClick={enrollment.openOffering}
        onEnrol={enrollment.handleEnrol}
      />

      <div>
        <SectionTitle>{isStudent ? "Your weekly schedule" : "Weekly schedule"}</SectionTitle>
        {isStudent ? (
          studentSchedule && studentSchedule.rows.length > 0 ? (
            <TeacherDetailStudentSchedule
              rows={studentSchedule.rows}
              occurrenceMap={studentSchedule.occurrenceMap}
              studentDisplayName={studentSchedule.studentDisplayName}
            />
          ) : (
            <InfoBlock>
              You have no enrolled classes yet. Pick a subject above to enrol in your first class
              with {name}.
            </InfoBlock>
          )
        ) : entries.length === 0 ? (
          <InfoBlock>This teacher hasn&apos;t published any class periods yet.</InfoBlock>
        ) : (
          <TeacherPublicCalendar entries={entries} onOfferingClick={enrollment.openOffering} />
        )}
      </div>
    </AvailabilityStack>
  );

  return (
    <>
      <TeacherPublicProfileView
        name={name}
        imageUrl={imageUrl}
        initials={initials}
        headline={headline}
        bio={bio}
        email={email}
        spokenLanguages={spokenLanguages}
        locationCountryCode={locationCountryCode}
        displayId={displayId}
        rating={rating}
        ratingsCount={ratingsCount}
        subjects={subjects}
        skills={skills}
        reviewsCount={testimonials.length}
        testimonials={testimonials}
        workExperiences={workExperiences}
      />

      <EnrollRegion aria-label="Classes and availability">
        <EnrollColumn>{availabilityPanel}</EnrollColumn>
      </EnrollRegion>

      <ClassDetailsDialog
        open={enrollment.selectedOfferingId !== null}
        onClose={enrollment.closeDialog}
        detail={selectedDetail}
        viewerRole={viewerRole}
        enrollmentId={selectedEnrollmentId}
        isBusy={
          enrollment.pendingOfferingId !== null &&
          enrollment.pendingOfferingId === enrollment.selectedOfferingId
        }
        message={enrollment.message}
        onEnrol={enrollment.handleEnrol}
        onDrop={(enrollmentId) => {
          if (enrollment.selectedOfferingId) {
            enrollment.handleDrop(enrollmentId, enrollment.selectedOfferingId);
          }
        }}
      />
    </>
  );
}
