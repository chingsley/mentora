"use client";

import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";

export const FormFieldRoot = styled.div<{ $hasLabel?: boolean }>`
  display: grid;
  grid-template-rows: ${({ $hasLabel }) =>
    $hasLabel
      ? `${FORM_FIELD.LABEL_SLOT_MIN_HEIGHT} auto auto`
      : "auto auto"};
  gap: ${SPACING.TWO};
  width: 100%;
  min-width: 0;
  align-content: start;
`;

export const FormFieldLabelSlot = styled.div`
  min-height: ${FORM_FIELD.LABEL_SLOT_MIN_HEIGHT};
  display: flex;
  align-items: flex-end;
`;

export const FormFieldLabel = styled.label`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: ${SPACING.ONE};
  width: 100%;
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.HEADER};
`;

export const FormFieldLabelNote = styled.span`
  font-size: ${FONTS.SIZE.XS};
  font-weight: ${FONTS.WEIGHT.NORMAL};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export const FormFieldControlSlot = styled.div`
  min-height: ${FORM_FIELD.CONTROL_MIN_HEIGHT};
`;

export const FormFieldMetaSlot = styled.div`
  min-height: 0;
`;

export const FormFieldHint = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.MUTED_FOREGROUND};
`;

export const FormFieldError = styled.p`
  margin: 0;
  font-size: ${FONTS.SIZE.XS};
  line-height: ${FONTS.LINE_HEIGHT.NORMAL};
  color: ${COLORS.DESTRUCTIVE};
`;
