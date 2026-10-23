"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useActionPending } from "@/hooks/useActionPending";
import styled from "styled-components";
import { addTeacherCourseAction, type ActionResult } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";
import {
  FormFieldControlSlot,
  FormFieldLabelSlot,
  FormFieldMetaSlot,
  FormFieldRoot,
  InlineFormFieldRow,
} from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TEACHER_PROFILE_ADD_COURSE } from "@/constants/teacherProfileCourse.constants";
import { isValidSubjectName, normalizeSubjectName } from "@/lib/subjectName";

export interface TeacherProfileEditCourseValues {
  subjectId: string;
  subjectName: string;
  defaultCap: number;
  yearsTaught: number;
}

export interface TeacherProfileAddCourseFormProps {
  globalCap: number;
  /** When set, the form edits this course instead of adding a new one. */
  editCourse?: TeacherProfileEditCourseValues | null;
  onClearEdit?: () => void;
  /** Drawer layout for profile course dialogs (matches `OfferingDialog`). */
  presentation?: "inline" | "drawer";
  onCancel?: () => void;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const FormGrid = styled.form`
  display: grid;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Span2 = styled.div`
  ${LAYOUT.MEDIA.SM} {
    grid-column: span 2 / span 2;
  }
`;

const FieldsRow = styled(InlineFormFieldRow)`
  grid-template-columns: 1fr;

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.75fr) minmax(0, 0.75fr) auto;
  }
`;

const Banner = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
`;

const FormError = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};

  ${LAYOUT.MEDIA.SM} {
    grid-column: span 2 / span 2;
  }
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

const DrawerFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${SPACING.TWO};

  ${LAYOUT.MEDIA.SM} {
    grid-column: span 2 / span 2;
  }
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

export function TeacherProfileAddCourseForm({
  globalCap,
  editCourse = null,
  onClearEdit,
  presentation = "inline",
  onCancel,
}: TeacherProfileAddCourseFormProps) {
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useActionPending();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [subjectName, setSubjectName] = React.useState("");
  const [classLimit, setClassLimit] = React.useState(String(defaultClassLimit(globalCap)));
  const [yearsTaught, setYearsTaught] = React.useState("0");
  const isEditing = editCourse !== null;
  const isDrawer = presentation === "drawer";

  const classLimitMax = effectiveClassLimitMax(globalCap);
  const canSubmit = isValidSubjectName(subjectName);

  function resetToEmpty() {
    setSubjectName("");
    setClassLimit(String(defaultClassLimit(globalCap)));
    setYearsTaught("0");
    setResult(null);
  }

  function applyEditCourse(course: TeacherProfileEditCourseValues) {
    setSubjectName(course.subjectName);
    setClassLimit(String(course.defaultCap));
    setYearsTaught(String(course.yearsTaught));
    setResult(null);
  }

  const prevEditId = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (editCourse) {
      applyEditCourse(editCourse);
      prevEditId.current = editCourse.subjectId;
      if (!isDrawer) {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      return;
    }
    if (prevEditId.current !== null) {
      resetToEmpty();
      prevEditId.current = null;
    }
  }, [editCourse, isDrawer]);

  function resetAfterSuccess() {
    resetToEmpty();
    onClearEdit?.();
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    const fd = new FormData();
    fd.append("subjectName", normalizeSubjectName(subjectName));
    if (isEditing && editCourse) {
      fd.append("subjectId", editCourse.subjectId);
    }
    fd.append("defaultCap", classLimit);
    fd.append("yearsTaught", yearsTaught);
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

  const subjectNameField = (
    <Input
      label="Course name"
      name="subjectName"
      value={subjectName}
      placeholder="e.g. Swimming lessons, AP Calculus"
      error={fieldError(fieldErrors, "subjectName")}
      disabled={isPending}
      onChange={(e) => setSubjectName(e.target.value)}
      hint="Any subject or course you teach — not limited to a preset list."
    />
  );

  const yearsTaughtField = (
    <Input
      type="number"
      inputMode="numeric"
      label="Years of experience"
      name="yearsTaught"
      value={yearsTaught}
      min={TEACHER_PROFILE_ADD_COURSE.YEARS_TAUGHT_MIN}
      max={TEACHER_PROFILE_ADD_COURSE.YEARS_TAUGHT_MAX}
      step={1}
      placeholder="e.g. 3"
      error={fieldError(fieldErrors, "yearsTaught")}
      disabled={isPending}
      onChange={(e) => setYearsTaught(e.target.value)}
      hint="How long you have taught this subject (shown on your profile)."
    />
  );

  const classLimitField = (
    <Input
      type="number"
      inputMode="numeric"
      label="Default class limit"
      labelNote={`admin limit: ${globalCap}`}
      name="defaultCap"
      value={classLimit}
      min={TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MIN}
      max={classLimitMax}
      step={1}
      placeholder={`${TEACHER_PROFILE_ADD_COURSE.CLASS_LIMIT_MIN}–${classLimitMax}`}
      error={fieldError(fieldErrors, "defaultCap")}
      disabled={isPending}
      onChange={(e) => setClassLimit(e.target.value)}
    />
  );

  const formLabel = isEditing ? "Edit course" : "Add a course";

  if (isDrawer) {
    return (
      <FormGrid ref={formRef} onSubmit={onSubmit} aria-label={formLabel}>
        <Span2>
          <Banner>
            You&apos;ll set your hourly rate for each class in the next step when you add times to
            your schedule.
          </Banner>
        </Span2>
        <Span2>{subjectNameField}</Span2>
        {yearsTaughtField}
        {classLimitField}
        {result && !result.ok ? <FormError>{result.error}</FormError> : null}
        <DrawerFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => onCancel?.()}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending} disabled={!canSubmit || isPending}>
            {isEditing ? "Save course" : "Add course"}
          </Button>
        </DrawerFooter>
      </FormGrid>
    );
  }

  return (
    <>
      <Form ref={formRef} onSubmit={onSubmit} aria-label={formLabel}>
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
        <Banner>
          You&apos;ll set your hourly rate for each class in the next step when you add times to your
          schedule.
        </Banner>
        <FieldsRow>
          {subjectNameField}
          {yearsTaughtField}
          {classLimitField}
          <FormFieldRoot $hasLabel>
            <FormFieldLabelSlot aria-hidden="true" />
            <FormFieldControlSlot>
              <Button type="submit" isLoading={isPending} disabled={!canSubmit || isPending}>
                {isEditing ? "Save course" : "Add course"}
              </Button>
            </FormFieldControlSlot>
            <FormFieldMetaSlot />
          </FormFieldRoot>
        </FieldsRow>
        {result && !result.ok ? <FormError>{result.error}</FormError> : null}
      </Form>
      <Divider />
    </>
  );
}
