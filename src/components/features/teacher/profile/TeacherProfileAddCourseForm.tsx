"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { addTeacherCourseAction, type ActionResult } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TEACHER_PROFILE_ADD_COURSE } from "@/constants/teacherProfileCourse.constants";
import {
  TeacherProfileSubjectSearch,
  type TeacherProfileSubjectOption,
} from "./TeacherProfileSubjectSearch";

export interface TeacherProfileEditCourseValues {
  subjectId: string;
  subjectName: string;
  hourlyRateMajor: number | null;
  defaultCap: number;
}

export interface TeacherProfileAddCourseFormProps {
  allSubjects: TeacherProfileSubjectOption[];
  teacherRegionCode: string | null;
  /** Region policy floor in major units (e.g. NGN); may exceed form minimum. */
  regionMinHourlyMajor: number | null;
  globalCap: number;
  /** When set, the form edits this course instead of adding a new one. */
  editCourse?: TeacherProfileEditCourseValues | null;
  onClearEdit?: () => void;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const FieldsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${SPACING.FOUR};
  align-items: end;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) auto;
    gap: ${SPACING.THREE};
  }
`;

const RateField = styled.div`
  min-width: 0;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    padding-bottom: ${SPACING.ONE};
  }
`;

const Banner = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const FormError = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const Divider = styled.hr`
  margin: 0;
  border: none;
  border-top: 1px solid ${COLORS.BORDER};
`;

const EditBanner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.TWO};
`;

const EditBannerText = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.HEADER};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
`;

function effectiveClassLimitMax(globalCap: number): number {
  return Math.min(TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MAX, globalCap);
}

function defaultClassLimit(globalCap: number): number {
  const max = effectiveClassLimitMax(globalCap);
  return Math.max(TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MIN, Math.min(10, max));
}

function fieldError(
  fieldErrors: Record<string, string> | undefined,
  key: string,
): string | undefined {
  const msg = fieldErrors?.[key];
  return msg && msg.length > 0 ? msg : undefined;
}

function effectiveRateMin(regionMinHourlyMajor: number | null): number {
  const floor = regionMinHourlyMajor ?? TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MIN;
  return Math.max(TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MIN, Math.ceil(floor));
}

export function TeacherProfileAddCourseForm({
  allSubjects,
  teacherRegionCode,
  regionMinHourlyMajor,
  globalCap,
  editCourse = null,
  onClearEdit,
}: TeacherProfileAddCourseFormProps) {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [subject, setSubject] = React.useState<TeacherProfileSubjectOption | null>(null);
  const [hourlyRate, setHourlyRate] = React.useState("");
  const [classLimit, setClassLimit] = React.useState(String(defaultClassLimit(globalCap)));
  const isEditing = editCourse !== null;

  const regionMissing = !teacherRegionCode;
  const rateMin = effectiveRateMin(regionMinHourlyMajor);
  const classLimitMax = effectiveClassLimitMax(globalCap);
  const canSubmit = !regionMissing && subject !== null;

  function resetToEmpty() {
    setSubject(null);
    setHourlyRate("");
    setClassLimit(String(defaultClassLimit(globalCap)));
    setResult(null);
  }

  function applyEditCourse(course: TeacherProfileEditCourseValues) {
    setSubject({ id: course.subjectId, name: course.subjectName });
    setHourlyRate(course.hourlyRateMajor != null ? String(course.hourlyRateMajor) : "");
    setClassLimit(String(course.defaultCap));
    setResult(null);
  }

  const prevEditId = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (editCourse) {
      applyEditCourse(editCourse);
      prevEditId.current = editCourse.subjectId;
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    if (prevEditId.current !== null) {
      resetToEmpty();
      prevEditId.current = null;
    }
  }, [editCourse]);

  function resetAfterSuccess() {
    resetToEmpty();
    onClearEdit?.();
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subject || !teacherRegionCode) return;

    const fd = new FormData();
    fd.append("subjectId", subject.id);
    fd.append("regionCode", teacherRegionCode);
    fd.append("hourlyRateMajor", hourlyRate);
    fd.append("defaultCap", classLimit);
    fd.append("isEdit", isEditing ? "true" : "false");

    startTransition(async () => {
      const res = await addTeacherCourseAction(fd);
      if (res.ok) {
        resetAfterSuccess();
        router.refresh();
        return;
      }
      setResult(res);
    });
  }

  const fieldErrors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <>
      <Form ref={formRef} onSubmit={onSubmit} aria-label={isEditing ? "Edit course" : "Add a course"}>
        {isEditing ? (
          <EditBanner>
            <EditBannerText>Editing {editCourse.subjectName}</EditBannerText>
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={() => onClearEdit?.()}
            >
              Cancel edit
            </Button>
          </EditBanner>
        ) : null}
        {regionMissing ? (
          <Banner>Set your teaching region on your profile before adding courses and rates.</Banner>
        ) : null}
        <FieldsRow>
          <TeacherProfileSubjectSearch
            subjects={allSubjects}
            value={subject}
            onChange={setSubject}
            error={fieldError(fieldErrors, "subjectId")}
            disabled={regionMissing || isPending || isEditing}
          />
          <RateField>
            <Input
              type="number"
              inputMode="decimal"
              label="Rate per hour"
              labelNote={regionMissing ? undefined : "limits by region"}
              name="hourlyRateMajor"
              value={hourlyRate}
              min={rateMin}
              max={TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MAX}
              step={1}
              placeholder={`${rateMin}–${TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MAX}`}
              error={fieldError(fieldErrors, "hourlyRateMajor")}
              disabled={regionMissing || isPending}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </RateField>
          <Input
            type="number"
            inputMode="numeric"
            label="Class limit"
            labelNote={regionMissing ? undefined : `admin limit: ${globalCap}`}
            name="defaultCap"
            value={classLimit}
            min={TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MIN}
            max={classLimitMax}
            step={1}
            placeholder={`${TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MIN}–${classLimitMax}`}
            error={fieldError(fieldErrors, "defaultCap")}
            disabled={regionMissing || isPending}
            onChange={(e) => setClassLimit(e.target.value)}
          />
          <Actions>
            <Button type="submit" isLoading={isPending} disabled={!canSubmit || isPending}>
              {isEditing ? "Save course" : "Add course"}
            </Button>
          </Actions>
        </FieldsRow>
        {result && !result.ok ? <FormError>{result.error}</FormError> : null}
      </Form>
      <Divider />
    </>
  );
}
