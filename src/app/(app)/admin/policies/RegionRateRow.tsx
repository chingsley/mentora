"use client";

import * as React from "react";
import styled from "styled-components";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

export const RegionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  & > li + li {
    border-top: 1px solid ${COLORS.BORDER};
  }
`;

const Row = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  padding: ${SPACING.THREE} 0;

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const Name = styled.p`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Floor = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.TWO};
`;

const SrLabel = styled.label`
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

const NumberInput = styled.input`
  height: 2.25rem;
  width: 10rem;
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.FOREGROUND};
  padding: 0 ${SPACING.TWO};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(23, 32, 51, 0.3);
  }
`;

const Suffix = styled.span`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export interface RegionRateRowProps {
  regionId: string;
  regionCode: string;
  regionName: string;
  currency: string;
  currentLabel: string;
  defaultMajor: number;
  step: number;
  action: (formData: FormData) => Promise<unknown>;
}

export function RegionRateRow({
  regionId,
  regionCode,
  regionName,
  currency,
  currentLabel,
  defaultMajor,
  step,
  action,
}: RegionRateRowProps) {
  return (
    <Row>
      <div>
        <Name>
          {regionName} ({regionCode})
        </Name>
        <Floor>Current floor: {currentLabel}/hr</Floor>
      </div>
      <Form action={action as (fd: FormData) => Promise<void>}>
        <input type="hidden" name="regionCode" value={regionCode} />
        <SrLabel htmlFor={`min-rate-${regionId}`}>
          Minimum hourly rate in {currency}
        </SrLabel>
        <NumberInput
          id={`min-rate-${regionId}`}
          name="hourlyRateMajor"
          type="number"
          min={0}
          step={step}
          inputMode="decimal"
          defaultValue={defaultMajor}
        />
        <Suffix>{currency}/hr</Suffix>
        <SubmitButton size="sm">Save</SubmitButton>
      </Form>
    </Row>
  );
}
