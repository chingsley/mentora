"use client";

import type { ChangeEvent } from "react";
import type { DayOfWeek } from "@prisma/client";
import styled, { css } from "styled-components";
import { CalendarDateField } from "@/components/features/calendar";
import { Select } from "@/components/ui/Select";
import { TimeInput } from "@/components/ui/TimeInput";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { MONTHLY_POSITION_OPTIONS } from "@/lib/offeringRecurrence";
import type { OfferingScheduleEditorValue, SetupScheduleFrequency } from "@/lib/offeringSchedule";
import {
  applySetupFrequencyToScheduleEditor,
  setupFrequencyFromScheduleEditor,
} from "@/lib/offeringSchedule";
import { DAY_CHIP_LABEL, DAY_LABEL, DAY_ORDER } from "@/lib/time";

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
  padding: ${SPACING.FOUR};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.HEADER_BORDER_15};
  background-color: ${COLORS.SURFACE_OFF_WHITE};
`;

const ModeRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const ModeLabel = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const SegmentedControl = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${SPACING.TWO};
  padding: ${SPACING.ONE};
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
`;

const modeButtonActiveStyles = css`
  border-color: ${COLORS.ACTION_PRIMARY_BORDER_25};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  color: ${COLORS.ACTION_PRIMARY};
  box-shadow: ${LAYOUT.SHADOW.SM};
`;

const ModeButton = styled.button<{ $active: boolean }>`
  border-radius: ${LAYOUT.RADIUS.SM};
  border: 1px solid ${COLORS.TRANSPARENT};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  background-color: ${COLORS.TRANSPARENT};
  color: ${COLORS.MUTED_FOREGROUND};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;

  ${(p) => p.$active && modeButtonActiveStyles}

  &:hover:not(:disabled) {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
    color: ${COLORS.HEADER};
  }

  ${(p) =>
    p.$active &&
    css`
      &:hover:not(:disabled) {
        background-color: ${COLORS.ACTION_PRIMARY_TINT_16};
        color: ${COLORS.ACTION_PRIMARY};
      }
    `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FieldsGrid = styled.div`
  display: grid;
  gap: ${SPACING.THREE};
  grid-template-columns: minmax(0, 1fr);

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${LAYOUT.MEDIA.MD} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const scheduleFormFieldColumnWidth = css`
  width: 100%;

  ${LAYOUT.MEDIA.SM} {
    width: calc((100% - ${SPACING.THREE}) / 2);
  }

  ${LAYOUT.MEDIA.MD} {
    width: calc((100% - ${SPACING.THREE} * 2) / 3);
  }
`;

const ScheduleDateTimeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  width: 100%;
`;

const DateFieldWrap = styled.div`
  flex: 0 0 auto;
  min-width: 0;
  ${scheduleFormFieldColumnWidth}

  > div {
    width: 100%;
  }
`;

const DateTimeSpacer = styled.div`
  flex: 0 0 ${SPACING.TEN};
  width: ${SPACING.TEN};
`;

const TimeFieldsGroup = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: start;
  min-width: 0;
`;

const EndTimeSpacer = styled.div`
  flex: 0 0 ${SPACING.EIGHT};
  width: ${SPACING.EIGHT};
`;

const CompactTimeField = styled.div`
  flex: 0 0 auto;
  width: fit-content;

  > div {
    width: fit-content;
  }
`;

const DaySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  grid-column: 1 / -1;
`;

const DayHint = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const DayToggleList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
`;

const DayToggle = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: calc(${SPACING.TEN} - ${SPACING.ONE});
  height: calc(${SPACING.TEN} - ${SPACING.ONE});
  padding: 0 ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  ${(p) =>
    p.$selected
      ? css`
          border-color: ${COLORS.ACTION_PRIMARY};
          background-color: ${COLORS.ACTION_PRIMARY};
          color: ${COLORS.WHITE};
        `
      : css`
          background-color: ${COLORS.FOREGROUND};
          color: ${COLORS.HEADER};

          &:hover:not(:disabled) {
            background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
            border-color: ${COLORS.SURFACE_NEUTRAL_BORDER_HOVER};
          }
        `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SectionError = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const FREQUENCY_OPTIONS: ReadonlyArray<{ value: SetupScheduleFrequency; label: string }> = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

export interface TeacherProfileCourseScheduleEditorProps {
  schedule: OfferingScheduleEditorValue;
  onChange: (schedule: OfferingScheduleEditorValue) => void;
  fieldErrors?: Record<string, string>;
  disabled?: boolean;
}

export function TeacherProfileCourseScheduleEditor({
  schedule,
  onChange,
  fieldErrors,
  disabled = false,
}: TeacherProfileCourseScheduleEditorProps) {
  const frequency = setupFrequencyFromScheduleEditor(schedule);
  const isRepeating = frequency !== "ONCE";
  const showDayPicker = isRepeating && frequency !== "MONTHLY";
  const isDaily = frequency === "DAILY";

  function patch(next: Partial<OfferingScheduleEditorValue>) {
    onChange({ ...schedule, ...next });
  }

  function setRepeating(repeating: boolean) {
    onChange(
      applySetupFrequencyToScheduleEditor(schedule, repeating ? "WEEKLY" : "ONCE"),
    );
  }

  function setFrequency(nextFrequency: SetupScheduleFrequency) {
    onChange(applySetupFrequencyToScheduleEditor(schedule, nextFrequency));
  }

  function handleFrequencyChange(event: ChangeEvent<HTMLSelectElement>) {
    setFrequency(event.target.value as SetupScheduleFrequency);
  }

  function toggleDay(day: DayOfWeek) {
    if (isDaily) return;
    const selected = new Set(schedule.selectedDays);
    if (selected.has(day)) {
      if (selected.size <= 1) return;
      selected.delete(day);
    } else {
      selected.add(day);
    }
    patch({
      selectedDays: DAY_ORDER.filter((candidate) => selected.has(candidate)),
    });
  }

  const slotsError = fieldErrors?.slots;
  const recurrenceError =
    fieldErrors?.["recurrence.kind"] ?? fieldErrors?.["recurrence.anchorDate"];

  return (
    <Panel>
      <ModeRow>
        <ModeLabel>Class period</ModeLabel>
        <SegmentedControl role="group" aria-label="Class period type">
          <ModeButton
            type="button"
            $active={!isRepeating}
            disabled={disabled}
            aria-pressed={!isRepeating}
            onClick={() => setRepeating(false)}
          >
            One time
          </ModeButton>
          <ModeButton
            type="button"
            $active={isRepeating}
            disabled={disabled}
            aria-pressed={isRepeating}
            onClick={() => setRepeating(true)}
          >
            Repeating
          </ModeButton>
        </SegmentedControl>
      </ModeRow>

      {isRepeating ? (
        <FieldsGrid>
          <Select
            label="How often"
            required
            value={frequency}
            disabled={disabled}
            onChange={handleFrequencyChange}
            options={FREQUENCY_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            error={recurrenceError}
          />
          {frequency === "MONTHLY" ? (
            <Select
              label="Week of month"
              required
              value={schedule.monthlyPosition}
              disabled={disabled}
              onChange={(event) =>
                patch({
                  monthlyPosition:
                    event.target.value as OfferingScheduleEditorValue["monthlyPosition"],
                })
              }
              options={MONTHLY_POSITION_OPTIONS.map((option) => ({
                value: option.id,
                label: option.label,
              }))}
            />
          ) : null}
        </FieldsGrid>
      ) : null}

      <ScheduleDateTimeRow>
        <DateFieldWrap>
          <CalendarDateField
            label={isRepeating ? "Starts on" : "Date"}
            required
            value={schedule.startDate}
            disabled={disabled}
            onChange={(startDate) => patch({ startDate })}
            error={fieldErrors?.["recurrence.anchorDate"]}
          />
        </DateFieldWrap>
        <DateTimeSpacer aria-hidden />
        <TimeFieldsGroup>
          <CompactTimeField>
            <TimeInput
              label="Start time"
              required
              value={schedule.startTime}
              disabled={disabled}
              onChange={(startTime) => patch({ startTime })}
              error={fieldErrors?.["slots.0.startTime"]}
            />
          </CompactTimeField>
          <EndTimeSpacer aria-hidden />
          <CompactTimeField>
            <TimeInput
              label="End time"
              required
              value={schedule.endTime}
              disabled={disabled}
              onChange={(endTime) => patch({ endTime })}
              error={fieldErrors?.["slots.0.endMinutes"]}
            />
          </CompactTimeField>
        </TimeFieldsGroup>
      </ScheduleDateTimeRow>

      {showDayPicker ? (
        <DaySection>
          <ModeLabel>Days</ModeLabel>
          {isDaily ? (
            <DayHint>Meets every day of the week at the times above.</DayHint>
          ) : (
            <DayHint>Select which days this class repeats.</DayHint>
          )}
          <DayToggleList role="group" aria-label="Days of the week">
            {DAY_ORDER.map((day) => (
              <DayToggle
                key={day}
                type="button"
                $selected={schedule.selectedDays.includes(day)}
                disabled={disabled || isDaily}
                aria-pressed={schedule.selectedDays.includes(day)}
                aria-label={DAY_LABEL[day]}
                title={DAY_LABEL[day]}
                onClick={() => toggleDay(day)}
              >
                {DAY_CHIP_LABEL[day]}
              </DayToggle>
            ))}
          </DayToggleList>
        </DaySection>
      ) : null}

      {frequency === "MONTHLY" ? (
        <DaySection>
          <ModeLabel>Weekday</ModeLabel>
          <DayHint>Which weekday of the month this class falls on.</DayHint>
          <DayToggleList role="group" aria-label="Weekday of month">
            {DAY_ORDER.map((day) => (
              <DayToggle
                key={day}
                type="button"
                $selected={schedule.selectedDays[0] === day}
                disabled={disabled}
                aria-pressed={schedule.selectedDays[0] === day}
                aria-label={DAY_LABEL[day]}
                title={DAY_LABEL[day]}
                onClick={() => patch({ selectedDays: [day] })}
              >
                {DAY_CHIP_LABEL[day]}
              </DayToggle>
            ))}
          </DayToggleList>
        </DaySection>
      ) : null}

      {slotsError ? <SectionError>{slotsError}</SectionError> : null}
    </Panel>
  );
}
