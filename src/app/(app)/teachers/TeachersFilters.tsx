"use client";

import Link from "next/link";
import * as React from "react";
import styled, { css } from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import type { DayOfWeek } from "@prisma/client";
import { DAY_LABEL, DAY_ORDER } from "@/lib/time";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const Grid = styled.div`
  display: grid;
  gap: ${SPACING.THREE};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${LAYOUT.MEDIA.LG} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const Field = styled.label<{ $span2?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.SM};

  ${(p) =>
    p.$span2 &&
    css`
      ${LAYOUT.MEDIA.SM} {
        grid-column: span 2 / span 2;
      }
    `}
`;

const FieldLabel = styled.span`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Input = styled.input`
  height: 2.5rem;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
`;

const SelectInput = styled.select`
  height: 2.5rem;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
`;

const Fieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.TWO};
  border: none;
  padding: 0;
`;

const Legend = styled.legend`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const DayRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const DayInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const DayLabel = styled.label<{ $active: boolean }>`
  cursor: pointer;
  border-radius: ${LAYOUT.RADIUS.FULL};
  border: 1px solid;
  padding: 0.25rem ${SPACING.THREE};
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  transition: background-color 0.15s ease, color 0.15s ease;

  ${(p) =>
    p.$active
      ? css`
          border-color: ${COLORS.HEADER};
          background-color: ${COLORS.HEADER};
          color: ${COLORS.WHITE};
        `
      : css`
          border-color: ${COLORS.BORDER};
          background-color: ${COLORS.FOREGROUND};
          color: ${COLORS.HEADER};

          &:hover {
            background-color: rgba(23, 32, 51, 0.05);
          }
        `}
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.THREE};
`;

const Submit = styled.button`
  display: inline-flex;
  height: 2.5rem;
  align-items: center;
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: ${COLORS.HEADER};
  padding: 0 ${SPACING.FOUR};
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.WHITE};
  border: none;
  cursor: pointer;

  &:hover {
    background-color: rgba(23, 32, 51, 0.9);
  }
`;

const ClearLink = styled(Link)`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.MUTED_FOREGROUND};
  text-decoration: none;

  &:hover {
    color: ${COLORS.HEADER};
    text-decoration: underline;
  }
`;

export interface TeachersFiltersProps {
  q?: string;
  subject?: string;
  region?: string;
  max?: string;
  day?: string;
  rating?: string;
  subjects: Array<{ id: string; slug: string; name: string }>;
  regions: Array<{ id: string; code: string; name: string; currency: string }>;
  maxRegion: { currency: string } | undefined;
}

export function TeachersFilters({
  q,
  subject,
  region,
  max,
  day,
  rating,
  subjects,
  regions,
  maxRegion,
}: TeachersFiltersProps) {
  return (
    <Form method="get">
      <Grid>
        <Field $span2>
          <FieldLabel>Search</FieldLabel>
          <Input name="q" defaultValue={q ?? ""} placeholder="Teacher name, ID, or subject" />
        </Field>
        <Field>
          <FieldLabel>Subject</FieldLabel>
          <SelectInput name="subject" defaultValue={subject ?? ""}>
            <option value="">Any</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field>
          <FieldLabel>Region</FieldLabel>
          <SelectInput name="region" defaultValue={region ?? ""}>
            <option value="">Any</option>
            {regions.map((r) => (
              <option key={r.id} value={r.code}>
                {r.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field>
          <FieldLabel>Max hourly ({maxRegion?.currency ?? "USD"})</FieldLabel>
          <Input
            name="max"
            defaultValue={max ?? ""}
            placeholder={
              maxRegion
                ? `e.g. ${maxRegion.currency === "NGN" ? "5000" : "25"}`
                : "e.g. 25"
            }
            inputMode="decimal"
            step="0.01"
            min={0}
          />
        </Field>
        <Field>
          <FieldLabel>Minimum rating</FieldLabel>
          <SelectInput name="rating" defaultValue={rating ?? ""}>
            <option value="">Any</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </SelectInput>
        </Field>
      </Grid>

      <Fieldset>
        <Legend>Teaches on</Legend>
        <DayRow>
          <DayRadio current={day} value="" label="Any day" />
          {DAY_ORDER.map((d: DayOfWeek) => (
            <DayRadio key={d} current={day} value={d} label={DAY_LABEL[d].slice(0, 3)} />
          ))}
        </DayRow>
      </Fieldset>

      <Actions>
        <Submit type="submit">Apply filters</Submit>
        <ClearLink href="/teachers">Clear all</ClearLink>
      </Actions>
    </Form>
  );
}

function DayRadio({
  current,
  value,
  label,
}: {
  current: string | undefined;
  value: string;
  label: string;
}) {
  const id = `day-${value || "any"}`;
  const isActive = (current ?? "") === value;
  return (
    <>
      <DayInput
        type="radio"
        id={id}
        name="day"
        value={value}
        defaultChecked={isActive}
      />
      <DayLabel htmlFor={id} $active={isActive}>
        {label}
      </DayLabel>
    </>
  );
}
