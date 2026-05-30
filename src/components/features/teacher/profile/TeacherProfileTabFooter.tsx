"use client";

import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  width: 100%;
  margin-top: ${SPACING.SIX};

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

export interface TeacherProfileTabFooterProps {
  onBack: () => void;
  /** Submit the enclosing form (footer rendered inside a `<form>`). */
  continueAsSubmit?: boolean;
  /** Submit a form by id when the footer sits outside that form. */
  continueFormId?: string;
  /** Advance without submitting (courses / schedule tabs). */
  onContinue?: () => void;
  isLoading?: boolean;
  backDisabled?: boolean;
  continueDisabled?: boolean;
}

export function TeacherProfileTabFooter({
  onBack,
  continueAsSubmit = false,
  continueFormId,
  onContinue,
  isLoading = false,
  backDisabled = false,
  continueDisabled = false,
}: TeacherProfileTabFooterProps) {
  const continueIsSubmit = continueAsSubmit || continueFormId != null;

  return (
    <Footer>
      <Button type="button" variant="secondary" onClick={onBack} disabled={backDisabled || isLoading}>
        Back
      </Button>
      <Button
        type={continueIsSubmit ? "submit" : "button"}
        form={continueFormId}
        variant="primary"
        isLoading={isLoading}
        disabled={continueDisabled}
        onClick={continueIsSubmit ? undefined : onContinue}
      >
        Save &amp; Continue
      </Button>
    </Footer>
  );
}
