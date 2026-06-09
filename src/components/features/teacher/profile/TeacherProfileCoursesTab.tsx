"use client";

import * as React from "react";
import styled from "styled-components";
import {
  TeacherProfileAddCourseForm,
  type TeacherProfileEditCourseValues,
} from "./TeacherProfileAddCourseForm";
import { TeacherProfileCoursesTable } from "./TeacherProfileCoursesTable";
import {
  TeacherProfileDeleteCourseDialog,
  type TeacherProfileDeleteCourseTarget,
} from "./TeacherProfileDeleteCourseDialog";
import { TeacherProfileFormSurface } from "@/components/features/teacher/profile/TeacherProfileFormSurface";
import { TeacherProfileTabFooter } from "@/components/features/teacher/profile/TeacherProfileTabFooter";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";
import { TEACHER_COURSES_FORM_ID } from "./teacherProfileFormIds";

export type TeacherProfileCoursesTabProps = Pick<
  TeacherProfileTabsProps,
  | "allSubjects"
  | "initialSubjects"
  | "taughtSubjects"
  | "taughtSubjectsWithStudents"
  | "globalCap"
  | "rateRegions"
  | "rateCells"
  | "teacherRegionCode"
> & {
  onAdvance: () => void;
  onBack: () => void;
};

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

export function TeacherProfileCoursesTab({
  allSubjects,
  taughtSubjects,
  taughtSubjectsWithStudents,
  globalCap,
  onAdvance,
  onBack,
}: TeacherProfileCoursesTabProps) {
  const [editCourse, setEditCourse] = React.useState<TeacherProfileEditCourseValues | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<TeacherProfileDeleteCourseTarget | null>(
    null,
  );

  function handleEditSubject(subjectId: string) {
    const row = taughtSubjects.find((s) => s.id === subjectId);
    if (!row) return;
    setDeleteTarget(null);
    setEditCourse({
      subjectId: row.id,
      subjectName: row.name,
      defaultCap: row.defaultCap ?? globalCap,
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

  return (
    <TeacherProfileFormSurface id={TEACHER_COURSES_FORM_ID} aria-label="Courses you teach">
      <Stack>
        <TeacherProfileAddCourseForm
          allSubjects={allSubjects}
          globalCap={globalCap}
          editCourse={editCourse}
          onClearEdit={() => setEditCourse(null)}
        />
        <TeacherProfileCoursesTable
          taughtSubjects={taughtSubjects}
          globalCap={globalCap}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
        />
      </Stack>
      <TeacherProfileTabFooter onBack={onBack} onContinue={onAdvance} />
      <TeacherProfileDeleteCourseDialog
        target={deleteTarget}
        onClose={() => {
          if (deleteTarget && editCourse?.subjectId === deleteTarget.subjectId) {
            setEditCourse(null);
          }
          setDeleteTarget(null);
        }}
      />
    </TeacherProfileFormSurface>
  );
}
