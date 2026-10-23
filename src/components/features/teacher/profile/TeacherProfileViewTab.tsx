"use client";

import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { TeacherPublicProfileView } from "@/components/features/teacher/public/TeacherPublicProfileView";
import { teacherSubjectTenureLabel } from "@/lib/formatTeacherSubjectYearsTaught";
import type { TeacherPublicProfileWorkExperience } from "@/types/teacherPublicProfileWorkExperience";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";
import { TeacherProfileBioEditPanel } from "./TeacherProfileBioEditPanel";
import { TeacherProfileContactDetailsPanel } from "./TeacherProfileContactDetailsPanel";
import { TeacherProfileHeroSummaryEdit } from "./TeacherProfileHeroSummaryEdit";
import { TeacherProfilePhotoHeroEdit } from "./TeacherProfilePhotoHeroEdit";
import type { TeacherProfileEditCourseValues } from "./TeacherProfileAddCourseForm";
import {
  TeacherProfileDeleteCourseDialog,
  type TeacherProfileDeleteCourseTarget,
} from "./TeacherProfileDeleteCourseDialog";
import { TeacherProfileAddCourseDialog } from "./TeacherProfileAddCourseDialog";
import { TeacherProfileEditCourseDialog } from "./TeacherProfileEditCourseDialog";
import { TeacherProfileScheduleTab } from "./TeacherProfileScheduleTab";
import {
  TeacherProfileDeleteWorkExperienceDialog,
  type TeacherProfileDeleteWorkExperienceTarget,
} from "./TeacherProfileDeleteWorkExperienceDialog";
import type { TeacherProfileEditWorkExperienceValues } from "./TeacherProfileWorkExperienceForm";
import { TeacherProfileWorkExperienceDialog } from "./TeacherProfileWorkExperienceDialog";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export type TeacherProfileViewTabProps = Pick<
  TeacherProfileTabsProps,
  | "fullName"
  | "initials"
  | "imageUrl"
  | "headline"
  | "bio"
  | "rating"
  | "ratingsCount"
  | "spokenLanguages"
  | "locationCountryCode"
  | "locationCity"
  | "locationLabel"
  | "taughtSubjects"
  | "taughtSubjectsWithStudents"
  | "globalCap"
  | "checklist"
  | "email"
  | "contactPhone"
  | "contactAddress"
  | "displayId"
  | "scheduleOfferings"
  | "dialogSubjects"
  | "inviteableStudents"
  | "billingCurrency"
  | "regionMinHourlyMajor"
  | "rateRegions"
  | "rateCells"
  | "teacherRegionCode"
  | "testimonials"
  | "reviewsCount"
> & {
  workExperiences: TeacherPublicProfileWorkExperience[];
  profileSection?: string | null;
  flushChromeToMainTop?: boolean;
  onNavigateProfileSection: (profileSection: string) => void;
};

export function TeacherProfileViewTab({
  fullName,
  initials,
  imageUrl,
  headline,
  bio,
  rating,
  ratingsCount,
  spokenLanguages,
  locationCountryCode,
  locationCity,
  locationLabel,
  taughtSubjects,
  taughtSubjectsWithStudents,
  globalCap,
  checklist,
  email,
  contactPhone,
  contactAddress,
  displayId,
  scheduleOfferings,
  dialogSubjects,
  inviteableStudents,
  billingCurrency,
  regionMinHourlyMajor,
  rateRegions,
  rateCells,
  teacherRegionCode,
  testimonials,
  reviewsCount,
  workExperiences,
  profileSection,
  flushChromeToMainTop = false,
  onNavigateProfileSection,
}: TeacherProfileViewTabProps) {
  const heroBandRef = React.useRef<HTMLDivElement>(null);
  const firstIncomplete = checklist.find((c) => !c.done && c.editTab);
  const [editCourse, setEditCourse] = React.useState<TeacherProfileEditCourseValues | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TeacherProfileDeleteCourseTarget | null>(
    null,
  );
  const [addCourseOpen, setAddCourseOpen] = React.useState(false);
  const [addExperienceOpen, setAddExperienceOpen] = React.useState(false);
  const [editExperience, setEditExperience] =
    React.useState<TeacherProfileEditWorkExperienceValues | null>(null);
  const [deleteExperienceTarget, setDeleteExperienceTarget] =
    React.useState<TeacherProfileDeleteWorkExperienceTarget | null>(null);

  function handleEditSubject(subjectId: string) {
    const row = taughtSubjects.find((s) => s.id === subjectId);
    if (!row) return;
    setDeleteTarget(null);
    setEditCourse({
      subjectId: row.id,
      subjectName: row.name,
      defaultCap: row.defaultCap ?? globalCap,
      yearsTaught: row.yearsTaught,
    });
  }

  function handleDeleteSubject(subjectId: string) {
    const row = taughtSubjects.find((s) => s.id === subjectId);
    if (!row) return;
    setEditCourse(null);
    const meta = taughtSubjectsWithStudents.find((s) => s.subjectId === subjectId);
    setDeleteTarget({
      subjectId: row.id,
      subjectName: row.name,
      studentCount: meta?.studentCount ?? 0,
    });
  }

  const subjects = taughtSubjects.map((taught) => ({
    id: taught.id,
    name: taught.name,
    tenureLabel: teacherSubjectTenureLabel(taught.yearsTaught),
  }));

  const defaultPublicTab =
    profileSection === "schedule"
      ? "schedule"
      : profileSection === "subjects"
        ? "subjects"
        : profileSection === "experience"
          ? "experience"
          : profileSection === "reviews"
            ? "reviews"
            : "about";

  React.useEffect(() => {
    if (
      (profileSection === "photo" || profileSection === "location") &&
      heroBandRef.current
    ) {
      heroBandRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [profileSection]);

  const photoEditor = (
    <TeacherProfilePhotoHeroEdit
      key={imageUrl ?? "no-photo"}
      imageUrl={imageUrl}
      initials={initials}
    />
  );

  const heroSummaryEditor = (
    <TeacherProfileHeroSummaryEdit
      key={`${headline}|${spokenLanguages}|${locationCountryCode}|${locationCity}`}
      headline={headline}
      spokenLanguages={spokenLanguages}
      locationCountryCode={locationCountryCode}
      locationCity={locationCity}
      locationLabel={locationLabel}
    />
  );

  const bioEditor = (
    <TeacherProfileBioEditPanel key={bio} bio={bio} presentation="viewEdit" saveLabel="Save" />
  );

  const contactEditor = (
    <TeacherProfileContactDetailsPanel
      key={`${email}|${contactPhone}|${contactAddress}`}
      email={email}
      contactPhone={contactPhone}
      contactAddress={contactAddress}
      presentation="viewEdit"
      saveLabel="Save"
    />
  );

  const schedulePanel = (
    <TeacherProfileScheduleTab
      key={`schedule-${scheduleOfferings.length}`}
      embedded
      scheduleOfferings={scheduleOfferings}
      dialogSubjects={dialogSubjects}
      inviteableStudents={inviteableStudents}
      globalCap={globalCap}
      billingCurrency={billingCurrency}
      regionMinHourlyMajor={regionMinHourlyMajor}
      rateRegions={rateRegions}
      rateCells={rateCells}
      teacherRegionCode={teacherRegionCode}
      onAdvance={() => onNavigateProfileSection("schedule")}
      onBack={() => onNavigateProfileSection("subjects")}
    />
  );

  const setupAction = firstIncomplete ? (
    <Button
      type="button"
      onClick={() =>
        onNavigateProfileSection(firstIncomplete.profileSection ?? "about")
      }
    >
      Complete: {firstIncomplete.label}
    </Button>
  ) : null;

  return (
    <Wrap>
      <TeacherPublicProfileView
        name={fullName}
        imageUrl={imageUrl}
        initials={initials}
        headline={headline}
        bio={bio}
        email={email}
        spokenLanguages={spokenLanguages}
        locationCountryCode={locationCountryCode}
        locationCity={locationCity}
        locationLabel={locationLabel}
        displayId={displayId}
        rating={rating}
        ratingsCount={ratingsCount}
        subjects={subjects}
        reviewsCount={reviewsCount}
        testimonials={testimonials}
        profilePreview
        profilePreviewSetupAction={setupAction}
        flushChromeToMainTop={flushChromeToMainTop}
        defaultTab={defaultPublicTab}
        schedulePanel={schedulePanel}
        photoEditor={photoEditor}
        heroSummaryEditor={heroSummaryEditor}
        bioEditor={bioEditor}
        contactEditor={contactEditor}
        phone={contactPhone}
        address={contactAddress}
        heroBandRef={heroBandRef}
        workExperiences={workExperiences}
        onEditSubject={handleEditSubject}
        onDeleteSubject={handleDeleteSubject}
        onAddSubject={() => {
          setEditCourse(null);
          setDeleteTarget(null);
          setAddCourseOpen(true);
        }}
        onAddExperience={() => {
          setEditExperience(null);
          setDeleteExperienceTarget(null);
          setAddExperienceOpen(true);
        }}
        onEditExperience={(id) => {
          const row = workExperiences.find((e) => e.id === id);
          if (!row) return;
          setAddExperienceOpen(false);
          setDeleteExperienceTarget(null);
          setEditExperience({
            id: row.id,
            company: row.company,
            role: row.role,
            startDate: row.startDate,
            endDate: row.endDate,
          });
        }}
        onDeleteExperience={(id) => {
          const row = workExperiences.find((e) => e.id === id);
          if (!row) return;
          setEditExperience(null);
          setAddExperienceOpen(false);
          setDeleteExperienceTarget({ id: row.id, company: row.company });
        }}
      />
      <TeacherProfileAddCourseDialog
        open={addCourseOpen}
        onClose={() => setAddCourseOpen(false)}
        globalCap={globalCap}
      />
      <TeacherProfileEditCourseDialog
        editCourse={editCourse}
        onClose={() => setEditCourse(null)}
        globalCap={globalCap}
      />
      <TeacherProfileDeleteCourseDialog
        target={deleteTarget}
        onClose={() => {
          if (deleteTarget && editCourse?.subjectId === deleteTarget.subjectId) {
            setEditCourse(null);
          }
          setDeleteTarget(null);
        }}
      />
      <TeacherProfileWorkExperienceDialog
        open={addExperienceOpen || editExperience !== null}
        editEntry={editExperience}
        onClose={() => {
          setAddExperienceOpen(false);
          setEditExperience(null);
        }}
      />
      <TeacherProfileDeleteWorkExperienceDialog
        target={deleteExperienceTarget}
        onClose={() => setDeleteExperienceTarget(null)}
      />
    </Wrap>
  );
}
