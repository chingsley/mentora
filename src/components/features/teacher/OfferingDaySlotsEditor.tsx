"use client";

import type { DayOfWeek } from "@prisma/client";
import * as React from "react";
import styled, { css } from "styled-components";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { OfferingDaySlotInput } from "@/lib/offeringSchedule";
import {
  activeScheduleDayPreset,
  applyScheduleDayPreset,
  nextUnusedDay,
  SCHEDULE_DAY_PRESETS,
} from "@/lib/offeringSchedule";
import { DAY_LABEL, DAY_ORDER } from "@/lib/time";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${SPACING.TWO};
`;

const Label = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Hint = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const PresetSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
`;

const PresetLabel = styled.span`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const PresetList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.TWO};
`;

const PresetButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid ${COLORS.BORDER};
  padding: ${SPACING.ONE} ${SPACING.THREE};
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
    p.$active
      ? css`
          border-color: ${COLORS.HEADER};
          background-color: ${COLORS.HEADER};
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

const SlotList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const SlotRow = styled.div`
  display: grid;
  gap: ${SPACING.THREE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${LAYOUT.RADIUS.LG};
  padding: ${SPACING.THREE};
  background-color: ${COLORS.FOREGROUND};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) auto;
    align-items: end;
  }
`;

const RemoveWrap = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
`;

const SectionError = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

export interface OfferingDaySlotsEditorProps {
  slots: OfferingDaySlotInput[];
  onChange: (slots: OfferingDaySlotInput[]) => void;
  fieldErrors?: Record<string, string>;
  disabled?: boolean;
  singleDayOnly?: boolean;
}

function slotError(fieldErrors: Record<string, string> | undefined, index: number, key: string) {
  return fieldErrors?.[`slots.${index}.${key}`];
}

export function OfferingDaySlotsEditor({
  slots,
  onChange,
  fieldErrors,
  disabled = false,
  singleDayOnly = false,
}: OfferingDaySlotsEditorProps) {
  function updateSlot(index: number, patch: Partial<OfferingDaySlotInput>) {
    onChange(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  function addSlot() {
    const usedDays = slots.map((slot) => slot.dayOfWeek);
    const template = slots[0];
    onChange([
      ...slots,
      {
        dayOfWeek: nextUnusedDay(usedDays),
        startTime: template?.startTime ?? "09:00",
        endTime: template?.endTime ?? "10:00",
      },
    ]);
  }

  function removeSlot(index: number) {
    if (slots.length === 1) return;
    onChange(slots.filter((_, i) => i !== index));
  }

  const usedDays = slots.map((slot) => slot.dayOfWeek);
  const canAddSlot = !singleDayOnly && usedDays.length < DAY_ORDER.length;
  const activePreset = singleDayOnly ? null : activeScheduleDayPreset(slots);

  function applyPreset(presetId: (typeof SCHEDULE_DAY_PRESETS)[number]["id"]) {
    onChange(applyScheduleDayPreset(slots, presetId));
  }

  return (
    <Wrap>
      <Header>
        <Label>Weekly time slots</Label>
        <Button
          type="button"
          variant="secondary"
          onClick={addSlot}
          disabled={disabled || !canAddSlot}
        >
          Add another day
        </Button>
      </Header>
      <PresetSection>
        <PresetLabel>Quick schedule</PresetLabel>
        <PresetList role="group" aria-label="Quick schedule presets">
          {(singleDayOnly ? SCHEDULE_DAY_PRESETS.filter((preset) => preset.id === "ONCE_WEEKLY") : SCHEDULE_DAY_PRESETS).map((preset) => (
            <PresetButton
              key={preset.id}
              type="button"
              $active={activePreset === preset.id}
              disabled={disabled}
              aria-pressed={activePreset === preset.id}
              onClick={() => applyPreset(preset.id)}
            >
              {preset.label}
            </PresetButton>
          ))}
        </PresetList>
      </PresetSection>
      <Hint>
        Pick a quick schedule, then set the day and time below. Use &ldquo;Add another day&rdquo; for
        custom mixes — for example Monday 9:00, Wednesday 12:00, and Friday 15:00.
      </Hint>
      {fieldErrors?.slots ? <SectionError>{fieldErrors.slots}</SectionError> : null}
      <SlotList>
        {slots.map((slot, index) => (
          <SlotRow key={`${index}-${slot.dayOfWeek}`}>
            <Select
              label="Day"
              required
              value={slot.dayOfWeek}
              disabled={disabled}
              onChange={(event) =>
                updateSlot(index, { dayOfWeek: event.target.value as DayOfWeek })
              }
              options={DAY_ORDER.filter(
                (day) => day === slot.dayOfWeek || !usedDays.includes(day),
              ).map((day) => ({
                value: day,
                label: DAY_LABEL[day],
              }))}
              error={slotError(fieldErrors, index, "dayOfWeek")}
            />
            <Input
              type="time"
              label="Start time"
              required
              value={slot.startTime}
              disabled={disabled}
              onChange={(event) => updateSlot(index, { startTime: event.target.value })}
              error={slotError(fieldErrors, index, "startTime")}
            />
            <Input
              type="time"
              label="End time"
              required
              value={slot.endTime}
              disabled={disabled}
              onChange={(event) => updateSlot(index, { endTime: event.target.value })}
              error={slotError(fieldErrors, index, "endMinutes")}
            />
            <RemoveWrap>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeSlot(index)}
                disabled={disabled || slots.length === 1}
                aria-label={`Remove ${DAY_LABEL[slot.dayOfWeek]} slot`}
              >
                Remove
              </Button>
            </RemoveWrap>
          </SlotRow>
        ))}
      </SlotList>
    </Wrap>
  );
}
