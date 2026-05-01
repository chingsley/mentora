"use client";

import styled from "styled-components";
import { TeacherProfileFormSurface } from "@/components/features/teacher/profile/TeacherProfileFormSurface";
import { SPACING } from "@/constants/spacing.constants";
import type { TeacherProfileTabsProps } from "./TeacherProfileTabs.types";
import { TEACHER_COURSES_FORM_ID, TEACHER_COURSES_RATES_FORM_ID } from "./teacherProfileFormIds";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

export type TeacherProfileCoursesTabProps = Pick<
  TeacherProfileTabsProps,
  | "allSubjects"
  | "initialSubjects"
  | "taughtSubjects"
  | "taughtSubjectsWithStudents"
  | "globalCap"
  | "rateRegions"
  | "rateCells"
> & {
  onAdvance: () => void;
};

/** Placeholder shells — subjects/rates UI wired back in later. */
export function TeacherProfileCoursesTab(_props: TeacherProfileCoursesTabProps) {
  return (
    <Wrap>
      <TeacherProfileFormSurface
        id={TEACHER_COURSES_FORM_ID}
        aria-label="Courses you teach"
      >
      </TeacherProfileFormSurface>
      {/* <TeacherProfileFormSurface
        id={TEACHER_COURSES_RATES_FORM_ID}
        aria-label="Hourly rates"
      /> */}
    </Wrap>
  );
}
