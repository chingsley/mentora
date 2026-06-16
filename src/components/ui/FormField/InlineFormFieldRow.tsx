"use client";

import styled from "styled-components";
import { SPACING } from "@/constants/spacing.constants";

export interface InlineFormFieldRowProps {
  /** CSS grid-template-columns value, e.g. `minmax(0, 2fr) minmax(0, 1fr)`. */
  $columns?: string;
}

/** Horizontal row of form fields — use with {@link FormFieldRoot} for aligned controls. */
export const InlineFormFieldRow = styled.div<InlineFormFieldRowProps>`
  display: grid;
  grid-template-columns: ${({ $columns }) => $columns ?? "repeat(auto-fit, minmax(0, 1fr))"};
  column-gap: ${SPACING.THREE};
  row-gap: 0;
  align-items: start;
  width: 100%;
`;
