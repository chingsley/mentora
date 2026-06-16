"use client";

import { OfferingPeriodType } from "@prisma/client";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled, { css } from "styled-components";
import {
  createOfferingAction,
  saveRateAction,
  updateOfferingAction,
  type ActionResult,
} from "@/app/(app)/profile/actions";
import { Input } from "@/components/ui/Input";
import { InlineFormFieldRow } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TEACHER_PROFILE_ADD_COURSE } from "@/constants/teacherProfileCourse.constants";
import {
  appendOfferingScheduleFormData,
  buildOfferingDialogInitial,
  defaultOfferingScheduleEditorValue,
  scheduleEditorValueFromSlots,
  slotsFromMinutes,
  type OfferingDialogSeed,
  type OfferingScheduleEditorValue,
} from "@/lib/offeringSchedule";
import { DEFAULT_OFFERING_RECURRENCE_INPUT } from "@/lib/offeringRecurrence";
import { smallestToMajor } from "@/lib/money";
import {
  buildScheduleCurrencyOptions,
  minHourlyRateMajorForCurrency,
  resolveRegionCodeForCurrency,
} from "@/lib/teacherProfileScheduleRate";
import { findSetupScheduleConflicts } from "@/lib/teacherScheduleConflicts";
import { TeacherProfileCourseScheduleEditor } from "./TeacherProfileCourseScheduleEditor";
import {
  TeacherProfileFormSection,
  TeacherProfileFormSectionStack,
} from "./TeacherProfileFormSection";
import { TeacherProfileFormSurface } from "./TeacherProfileFormSurface";
import { TeacherProfileTabFooter } from "./TeacherProfileTabFooter";
import type {
  TeacherProfileScheduleOffering,
  TeacherProfileTabsProps,
} from "./TeacherProfileTabs.types";
import { TEACHER_SCHEDULE_FORM_ID } from "./teacherProfileFormIds";

const EmptyState = styled.p`
  margin: 0;
  padding: ${SPACING.FIVE};
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.SURFACE_OFF_WHITE};
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const CourseFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FIVE};
`;

/** One full schedule column + half column — 2:1 rate vs currency. */
const rateCurrencyRowWidth = css`
  width: 100%;

  ${LAYOUT.MEDIA.SM} {
    width: calc(((100% - ${SPACING.THREE}) / 2) * 1.5);
  }

  ${LAYOUT.MEDIA.MD} {
    width: calc(((100% - ${SPACING.THREE} * 2) / 3) * 1.5);
  }
`;

const RateSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  padding-bottom: ${SPACING.FOUR};
  border-bottom: 1px solid ${COLORS.HEADER_BORDER_15};
`;

const RateFieldsRow = styled(InlineFormFieldRow)`
  ${rateCurrencyRowWidth}
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
`;

const FormError = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const FormErrorBanner = styled.div`
  width: 100%;
  margin-bottom: ${SPACING.TWO};
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.DESTRUCTIVE_BORDER_HOVER};
  background-color: ${COLORS.DESTRUCTIVE_TINT_10};
`;

interface CourseScheduleDraft {
  offeringId?: string;
  title: string;
  hourlyRate: string;
  currency: string;
  schedule: OfferingScheduleEditorValue;
}

type RateRegion = TeacherProfileTabsProps["rateRegions"][number];

export interface TeacherProfileScheduleSetupFormProps {
  scheduleOfferings: TeacherProfileScheduleOffering[];
  dialogSubjects: { id: string; name: string; defaultCap: number }[];
  globalCap: number;
  billingCurrency: string;
  regionMinHourlyMajor: number | null;
  rateRegions: RateRegion[];
  rateCells: TeacherProfileTabsProps["rateCells"];
  teacherRegionCode: string | null;
  onAdvance: () => void;
  onBack: () => void;
}

function toOfferingDialogSeed(offering: TeacherProfileScheduleOffering): OfferingDialogSeed {
  return {
    id: offering.id,
    scheduleGroupId: offering.scheduleGroupId,
    dayOfWeek: offering.dayOfWeek,
    title: offering.title,
    description: offering.description,
    subjectId: offering.subjectId,
    startMinutes: offering.startMinutes,
    endMinutes: offering.endMinutes,
    periodType: offering.periodType,
    teacherCap: offering.teacherCap,
    hourlyRate: offering.hourlyRate,
    invitedStudentProfileIds: offering.invitedStudentProfileIds,
    enrolled: offering.enrolled,
    recurrenceKind: offering.recurrenceKind,
    recurrenceAnchorDate: offering.recurrenceAnchorDate,
    recurrenceOrdinal: offering.recurrenceOrdinal,
  };
}

function initialScheduleForSubject(
  subjectId: string,
  offerings: TeacherProfileScheduleOffering[],
): OfferingScheduleEditorValue {
  const subjectOfferings = offerings.filter((offering) => offering.subjectId === subjectId);
  if (subjectOfferings.length === 0) {
    return defaultOfferingScheduleEditorValue();
  }

  const seeds = offerings.map(toOfferingDialogSeed);
  const target = subjectOfferings.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  )[0]!;
  const dialogInitial = buildOfferingDialogInitial(toOfferingDialogSeed(target), seeds);
  const slots = dialogInitial.slots?.length
    ? slotsFromMinutes(dialogInitial.slots)
    : slotsFromMinutes([
        {
          dayOfWeek: dialogInitial.dayOfWeek,
          startMinutes: dialogInitial.startMinutes,
          endMinutes: dialogInitial.endMinutes,
        },
      ]);

  const recurrence = dialogInitial.recurrence
    ? {
        kind: dialogInitial.recurrence.kind,
        anchorDate: dialogInitial.recurrence.anchorDate ?? "",
        ordinal: dialogInitial.recurrence.ordinal ?? ("" as const),
        interval: dialogInitial.recurrence.interval ?? ("" as const),
      }
    : DEFAULT_OFFERING_RECURRENCE_INPUT;

  return scheduleEditorValueFromSlots(slots, recurrence);
}

function buildInitialDrafts(
  subjects: TeacherProfileScheduleSetupFormProps["dialogSubjects"],
  offerings: TeacherProfileScheduleOffering[],
  billingCurrency: string,
  rateRegions: RateRegion[],
  rateCells: TeacherProfileTabsProps["rateCells"],
  teacherRegionCode: string | null,
): Record<string, CourseScheduleDraft> {
  const drafts: Record<string, CourseScheduleDraft> = {};
  const defaultCurrency =
    rateRegions.find((region) => region.code === teacherRegionCode)?.currency ?? billingCurrency;

  for (const subject of subjects) {
    const subjectOfferings = offerings.filter((offering) => offering.subjectId === subject.id);
    const primaryOffering = subjectOfferings.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    )[0];
    const currency = defaultCurrency;
    const regionCode = resolveRegionCodeForCurrency(currency, rateRegions, teacherRegionCode);
    const savedRate = regionCode
      ? rateCells.find(
          (cell) => cell.subjectId === subject.id && cell.regionCode === regionCode,
        )
      : undefined;

    drafts[subject.id] = {
      offeringId: primaryOffering?.id,
      title: primaryOffering?.title ?? subject.name,
      hourlyRate:
        savedRate != null
          ? String(savedRate.hourlyMajor)
          : primaryOffering != null && primaryOffering.hourlyRate > 0
            ? String(smallestToMajor(primaryOffering.hourlyRate, currency))
            : "",
      currency,
      schedule: initialScheduleForSubject(subject.id, offerings),
    };
  }

  return drafts;
}

export function TeacherProfileScheduleSetupForm({
  scheduleOfferings,
  dialogSubjects,
  globalCap,
  billingCurrency,
  rateRegions,
  rateCells,
  teacherRegionCode,
  onAdvance,
  onBack,
}: TeacherProfileScheduleSetupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [fieldErrorsBySubject, setFieldErrorsBySubject] = React.useState<
    Record<string, Record<string, string>>
  >({});

  const currencyOptions = React.useMemo(
    () => buildScheduleCurrencyOptions(rateRegions),
    [rateRegions],
  );

  const [drafts, setDrafts] = React.useState<Record<string, CourseScheduleDraft>>(() =>
    buildInitialDrafts(
      dialogSubjects,
      scheduleOfferings,
      billingCurrency,
      rateRegions,
      rateCells,
      teacherRegionCode,
    ),
  );

  React.useEffect(() => {
    setDrafts(
      buildInitialDrafts(
        dialogSubjects,
        scheduleOfferings,
        billingCurrency,
        rateRegions,
        rateCells,
        teacherRegionCode,
      ),
    );
    setFieldErrorsBySubject({});
    setGlobalError(null);
  }, [
    dialogSubjects,
    scheduleOfferings,
    billingCurrency,
    rateRegions,
    rateCells,
    teacherRegionCode,
  ]);

  function patchDraft(subjectId: string, patch: Partial<CourseScheduleDraft>) {
    setDrafts((current) => ({
      ...current,
      [subjectId]: { ...current[subjectId]!, ...patch },
    }));
  }

  function scrollToFirstScheduleError(errorsBySubject: Record<string, Record<string, string>>) {
    const firstSubjectId = dialogSubjects.find((subject) => errorsBySubject[subject.id])?.id;
    if (!firstSubjectId) return;
    requestAnimationFrame(() => {
      document.getElementById(`schedule-course-${firstSubjectId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function mergeSubjectFieldErrors(
    result: Extract<ActionResult, { ok: false }>,
    current: Record<string, string> | undefined,
  ): Record<string, string> {
    const merged = { ...current, ...result.fieldErrors };
    if (!merged.slots && result.error) {
      merged.slots = result.error;
    }
    return merged;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGlobalError(null);
    setFieldErrorsBySubject({});

    const clientScheduleErrors = findSetupScheduleConflicts({
      subjects: dialogSubjects,
      drafts,
      existingOfferings: scheduleOfferings.map((offering) => ({
        subjectId: offering.subjectId,
        subjectName: offering.subjectName,
        dayOfWeek: offering.dayOfWeek,
        startMinutes: offering.startMinutes,
        endMinutes: offering.endMinutes,
      })),
    });

    if (Object.keys(clientScheduleErrors).length > 0) {
      const nextFieldErrors = Object.fromEntries(
        Object.entries(clientScheduleErrors).map(([subjectId, message]) => [
          subjectId,
          { slots: message },
        ]),
      );
      setFieldErrorsBySubject(nextFieldErrors);
      setGlobalError(Object.values(clientScheduleErrors)[0] ?? "Resolve the schedule conflicts below.");
      scrollToFirstScheduleError(nextFieldErrors);
      return;
    }

    startTransition(async () => {
      const nextFieldErrors: Record<string, Record<string, string>> = {};
      const errors: string[] = [];

      for (const subject of dialogSubjects) {
        const draft = drafts[subject.id];
        if (!draft) continue;

        const regionCode = resolveRegionCodeForCurrency(
          draft.currency,
          rateRegions,
          teacherRegionCode,
        );
        if (!regionCode) {
          nextFieldErrors[subject.id] = {
            ...nextFieldErrors[subject.id],
            currency: "Billing for this currency is not configured yet. Choose another currency.",
          };
          errors.push(`Billing is not available for ${draft.currency} yet.`);
          continue;
        }

        const rateFormData = new FormData();
        rateFormData.set("subjectId", subject.id);
        rateFormData.set("regionCode", regionCode);
        rateFormData.set("hourlyRateMajor", draft.hourlyRate);
        const rateResult = await saveRateAction(rateFormData);
        if (!rateResult.ok) {
          if (rateResult.fieldErrors) {
            nextFieldErrors[subject.id] = {
              ...nextFieldErrors[subject.id],
              ...rateResult.fieldErrors,
            };
          }
          errors.push(rateResult.error ?? `Could not save rate for ${subject.name}.`);
          continue;
        }

        const formData = new FormData();
        appendOfferingScheduleFormData(formData, {
          subjectId: subject.id,
          title: draft.title.trim() || subject.name,
          hourlyRateMajor: draft.hourlyRate,
          teacherCap: String(subject.defaultCap ?? globalCap),
          periodType: OfferingPeriodType.OPEN,
          schedule: draft.schedule,
          offeringId: draft.offeringId,
        });

        const action = draft.offeringId ? updateOfferingAction : createOfferingAction;
        const result: ActionResult = await action(formData);

        if (!result.ok) {
          nextFieldErrors[subject.id] = mergeSubjectFieldErrors(result, nextFieldErrors[subject.id]);
          errors.push(result.error ?? `Could not save schedule for ${subject.name}.`);
        }
      }

      if (errors.length > 0) {
        setFieldErrorsBySubject(nextFieldErrors);
        setGlobalError(errors[0] ?? "Please fix the highlighted fields.");
        scrollToFirstScheduleError(nextFieldErrors);
        return;
      }

      router.refresh();
      onAdvance();
    });
  }

  if (dialogSubjects.length === 0) {
    return (
      <>
        <EmptyState>
          Pick your subjects in the Courses step first, then set a schedule and hourly rate for
          each one here.
        </EmptyState>
        <TeacherProfileTabFooter onBack={onBack} onContinue={onAdvance} />
      </>
    );
  }

  return (
    <TeacherProfileFormSurface id={TEACHER_SCHEDULE_FORM_ID} aria-label="Class scheduling">
      <form onSubmit={handleSubmit}>
        {globalError ? (
          <FormErrorBanner role="alert">
            <FormError>{globalError}</FormError>
          </FormErrorBanner>
        ) : null}
        <TeacherProfileFormSectionStack $setup>
          {dialogSubjects.map((subject, index) => {
            const draft = drafts[subject.id];
            if (!draft) return null;
            const fieldErrors = fieldErrorsBySubject[subject.id];

            return (
              <TeacherProfileFormSection
                key={subject.id}
                id={`schedule-course-${subject.id}`}
                stepLabel={`${index + 1} of ${dialogSubjects.length}`}
                title={subject.name}
                hint="Set your hourly rate for this class. Students book at this rate."
              >
                <CourseFields>
                  <RateSection>
                    <RateFieldsRow>
                      <Input
                        type="number"
                        inputMode="decimal"
                        label="Hourly rate"
                        labelNote={`min ${minHourlyRateMajorForCurrency(draft.currency, rateRegions)}`}
                        value={draft.hourlyRate}
                        onChange={(event) =>
                          patchDraft(subject.id, { hourlyRate: event.target.value })
                        }
                        min={minHourlyRateMajorForCurrency(draft.currency, rateRegions)}
                        max={TEACHER_PROFILE_ADD_COURSE.HOURLY_RATE_MAX}
                        step={1}
                        required
                        disabled={isPending}
                        hint="Billed per completed session."
                        error={fieldErrors?.hourlyRateMajor}
                      />
                      <Select
                        label="Currency"
                        required
                        value={draft.currency}
                        disabled={isPending}
                        onChange={(event) =>
                          patchDraft(subject.id, { currency: event.target.value })
                        }
                        options={currencyOptions}
                        error={fieldErrors?.currency}
                      />
                    </RateFieldsRow>
                  </RateSection>

                  <TeacherProfileCourseScheduleEditor
                    schedule={draft.schedule}
                    onChange={(schedule) => patchDraft(subject.id, { schedule })}
                    fieldErrors={fieldErrors}
                    disabled={isPending}
                  />
                </CourseFields>
              </TeacherProfileFormSection>
            );
          })}
        </TeacherProfileFormSectionStack>

        <TeacherProfileTabFooter
          onBack={onBack}
          continueAsSubmit
          isLoading={isPending}
          backDisabled={isPending}
        />
      </form>
    </TeacherProfileFormSurface>
  );
}
