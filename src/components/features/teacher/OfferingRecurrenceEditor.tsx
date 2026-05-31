"use client";

import type { ChangeEvent } from "react";
import type { DayOfWeek } from "@prisma/client";
import styled from "styled-components";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { OfferingRecurrenceInput } from "@/lib/offeringRecurrence";
import {
  formatRecurrencePatternLabel,
  patternToRecurrence,
  recurrenceRequiresAnchorDate,
  recurrenceToPattern,
  RECURRENCE_PATTERN_OPTIONS,
} from "@/lib/offeringRecurrence";
import { DAY_LABEL } from "@/lib/time";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const Hint = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

const Summary = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
`;

export interface OfferingRecurrenceEditorProps {
  recurrence: OfferingRecurrenceInput;
  onChange: (recurrence: OfferingRecurrenceInput) => void;
  primaryDayOfWeek: DayOfWeek;
  fieldErrors?: Partial<Record<"recurrenceKind" | "recurrenceAnchorDate", string>>;
  disabled?: boolean;
}

export function OfferingRecurrenceEditor({
  recurrence,
  onChange,
  primaryDayOfWeek,
  fieldErrors,
  disabled = false,
}: OfferingRecurrenceEditorProps) {
  const patternId = recurrenceToPattern(recurrence);
  const dayLabel = DAY_LABEL[primaryDayOfWeek];
  const showAnchorDate = recurrenceRequiresAnchorDate(recurrence.kind);

  function handlePatternChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(
      patternToRecurrence(
        event.target.value as (typeof RECURRENCE_PATTERN_OPTIONS)[number]["id"],
        recurrence,
        primaryDayOfWeek,
      ),
    );
  }

  return (
    <Wrap>
      <Select
        label="Repeats"
        required
        value={patternId}
        disabled={disabled}
        onChange={handlePatternChange}
        options={RECURRENCE_PATTERN_OPTIONS.map((option) => ({
          value: option.id,
          label: formatRecurrencePatternLabel(option.id, primaryDayOfWeek),
        }))}
        error={fieldErrors?.recurrenceKind}
      />
      {showAnchorDate ? (
        <Input
          type="date"
          label={recurrence.kind === "ONCE" ? "Event date" : "Starting date"}
          required
          value={recurrence.anchorDate}
          disabled={disabled}
          onChange={(event) => onChange({ ...recurrence, anchorDate: event.target.value })}
          hint={
            recurrence.kind === "ONCE"
              ? "This class happens once on the date you pick."
              : `Repeats every 2 weeks on ${dayLabel}, counting from this date.`
          }
          error={fieldErrors?.recurrenceAnchorDate}
        />
      ) : null}
      <Summary>{formatRecurrencePatternLabel(patternId, primaryDayOfWeek)}</Summary>
      <Hint>
        Monthly patterns use the weekday from your time slot above — for example Physics 201 on the
        2nd Monday of each month.
      </Hint>
    </Wrap>
  );
}
