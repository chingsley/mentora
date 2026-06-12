"use client";

import type { ChangeEvent } from "react";
import type { DayOfWeek } from "@prisma/client";
import { Repeat, Trash2 } from "lucide-react";
import styled, { css } from "styled-components";
import { CalendarDateField } from "@/components/features/calendar";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { ICON_SIZE, ICON_STROKE } from "@/constants/iconTheme.constants";
import {
  MONTHLY_POSITION_OPTIONS,
  RECURRENCE_WEEK_INTERVAL,
} from "@/lib/offeringRecurrence";
import type { OfferingScheduleEditorValue } from "@/lib/offeringSchedule";
import { DAY_CHIP_LABEL, DAY_LABEL, DAY_ORDER } from "@/lib/time";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${LAYOUT.RADIUS.LG};
  padding: ${SPACING.FOUR};
  background-color: ${COLORS.FOREGROUND};
`;

const DateTimeRow = styled.div`
  display: grid;
  gap: ${SPACING.THREE};
  grid-template-columns: minmax(0, 1fr);

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr);
  }
`;

const OptionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.THREE};
`;

const recurringButtonActiveStyles = css`
  border-color: ${COLORS.ACTION_PRIMARY_BORDER_25};
  background-color: ${COLORS.ACTION_PRIMARY_TINT_10};
  color: ${COLORS.ACTION_PRIMARY};
`;

const RecurringButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.TWO};
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  background-color: ${COLORS.FOREGROUND};
  color: ${COLORS.MUTED_FOREGROUND};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  ${(p) => p.$active && recurringButtonActiveStyles}

  &:hover:not(:disabled) {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
    border-color: ${COLORS.SURFACE_NEUTRAL_BORDER_HOVER};
  }

  ${(p) =>
    p.$active &&
    css`
      &:hover:not(:disabled) {
        background-color: ${COLORS.ACTION_PRIMARY_TINT_16};
        border-color: ${COLORS.ACTION_PRIMARY_BORDER_25};
      }
    `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RecurrenceRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${SPACING.TWO} ${SPACING.THREE};
`;

const InlineLabel = styled.span`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  white-space: nowrap;
`;

const CompactSelectWrap = styled.div<{ $width?: "interval" | "unit" | "position" | "until" }>`
  flex: 0 0 auto;
  min-width: ${(p) => {
    if (p.$width === "interval") return `calc(${SPACING.TEN} + ${SPACING.FOUR})`;
    if (p.$width === "unit") return `calc(${SPACING.TEN} * 1.5)`;
    if (p.$width === "position") return `calc(${SPACING.TEN} * 2)`;
    if (p.$width === "until") return `calc(${SPACING.TEN} * 2.5)`;
    return `calc(${SPACING.TEN} * 2)`;
  }};
`;

const DayToggleList = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.ONE};
`;

const DayToggle = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(${SPACING.TEN} - ${SPACING.ONE});
  height: calc(${SPACING.TEN} - ${SPACING.ONE});
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  font-family: ${FONTS.FAMILY.PRIMARY};
  font-size: ${FONTS.SIZE.XS};
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

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding: ${SPACING.TWO};
  border: none;
  border-radius: ${LAYOUT.RADIUS.MD};
  background: ${COLORS.TRANSPARENT};
  color: ${COLORS.MUTED_FOREGROUND};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${COLORS.SURFACE_NEUTRAL_HOVER};
    color: ${COLORS.DESTRUCTIVE};
  }

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

const REPEAT_UNIT_OPTIONS = [
  { value: "week", label: "week" },
  { value: "month", label: "month" },
] as const;

const INTERVAL_OPTIONS = Array.from(
  { length: RECURRENCE_WEEK_INTERVAL.MAX },
  (_, index) => {
    const value = String(index + 1);
    return { value, label: value };
  },
);

export interface OfferingDaySlotsEditorProps {
  schedule: OfferingScheduleEditorValue;
  onChange: (schedule: OfferingScheduleEditorValue) => void;
  fieldErrors?: Record<string, string>;
  disabled?: boolean;
}

export function OfferingDaySlotsEditor({
  schedule,
  onChange,
  fieldErrors,
  disabled = false,
}: OfferingDaySlotsEditorProps) {
  function patch(next: Partial<OfferingScheduleEditorValue>) {
    onChange({ ...schedule, ...next });
  }

  function handleRepeatUnitChange(event: ChangeEvent<HTMLSelectElement>) {
    patch({
      repeatUnit: event.target.value as OfferingScheduleEditorValue["repeatUnit"],
      repeatInterval: 1,
    });
  }

  function toggleDay(day: DayOfWeek) {
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

  function toggleRecurring() {
    patch({ isRecurring: !schedule.isRecurring });
  }

  function clearRecurrence() {
    patch({ isRecurring: false, untilDate: "" });
  }

  const slotsError = fieldErrors?.slots;
  const recurrenceError =
    fieldErrors?.["recurrence.kind"] ?? fieldErrors?.["recurrence.anchorDate"];

  return (
    <Wrap>
      <DateTimeRow>
        <CalendarDateField
          label="Start date"
          required
          value={schedule.startDate}
          disabled={disabled}
          onChange={(startDate) => patch({ startDate })}
          error={fieldErrors?.["recurrence.anchorDate"]}
        />
        <Input
          type="time"
          label="Start time"
          required
          value={schedule.startTime}
          disabled={disabled}
          onChange={(event) => patch({ startTime: event.target.value })}
          error={fieldErrors?.["slots.0.startTime"]}
        />
        <Input
          type="time"
          label="End time"
          required
          value={schedule.endTime}
          disabled={disabled}
          onChange={(event) => patch({ endTime: event.target.value })}
          error={fieldErrors?.["slots.0.endMinutes"]}
        />
      </DateTimeRow>

      <OptionsRow>
        <RecurringButton
          type="button"
          $active={schedule.isRecurring}
          disabled={disabled}
          aria-pressed={schedule.isRecurring}
          onClick={toggleRecurring}
        >
          <Repeat
            size={ICON_SIZE.SM}
            strokeWidth={ICON_STROKE.NORMAL}
            color={schedule.isRecurring ? COLORS.ACTION_PRIMARY : COLORS.MUTED_FOREGROUND}
          />
          Recurring
        </RecurringButton>
      </OptionsRow>

      {schedule.isRecurring ? (
        <RecurrenceRow>
          <InlineLabel>Repeat every</InlineLabel>
          <CompactSelectWrap $width="interval">
            <Select
              aria-label="Repeat interval"
              required
              value={String(schedule.repeatInterval)}
              disabled={disabled || schedule.repeatUnit === "month"}
              onChange={(event) =>
                patch({ repeatInterval: Number.parseInt(event.target.value, 10) || 1 })
              }
              options={INTERVAL_OPTIONS}
              error={recurrenceError}
            />
          </CompactSelectWrap>
          <CompactSelectWrap $width="unit">
            <Select
              aria-label="Repeat unit"
              required
              value={schedule.repeatUnit}
              disabled={disabled}
              onChange={handleRepeatUnitChange}
              options={[...REPEAT_UNIT_OPTIONS]}
            />
          </CompactSelectWrap>

          {schedule.repeatUnit === "month" ? (
            <>
              <InlineLabel>on the</InlineLabel>
              <CompactSelectWrap $width="position">
                <Select
                  aria-label="Week of month"
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
              </CompactSelectWrap>
            </>
          ) : null}

          <DayToggleList role="group" aria-label="Days of the week">
            {DAY_ORDER.map((day) => (
              <DayToggle
                key={day}
                type="button"
                $selected={schedule.selectedDays.includes(day)}
                disabled={disabled}
                aria-pressed={schedule.selectedDays.includes(day)}
                aria-label={DAY_LABEL[day]}
                title={DAY_LABEL[day]}
                onClick={() => toggleDay(day)}
              >
                {DAY_CHIP_LABEL[day]}
              </DayToggle>
            ))}
          </DayToggleList>

          <InlineLabel>Until</InlineLabel>
          <CompactSelectWrap $width="until">
            <CalendarDateField
              aria-label="Until date"
              value={schedule.untilDate}
              disabled={disabled}
              onChange={(untilDate) => patch({ untilDate })}
            />
          </CompactSelectWrap>

          <IconButton
            type="button"
            disabled={disabled}
            aria-label="Clear recurrence"
            onClick={clearRecurrence}
          >
            <Trash2 size={ICON_SIZE.SM} strokeWidth={ICON_STROKE.NORMAL} />
          </IconButton>
        </RecurrenceRow>
      ) : null}

      {slotsError ? <SectionError>{slotsError}</SectionError> : null}
    </Wrap>
  );
}
