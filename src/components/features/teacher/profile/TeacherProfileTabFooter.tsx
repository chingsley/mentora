"use client";

import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { COLORS } from "@/constants/colors.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { useTeacherProfileSetupMode, useTeacherProfileSetupSkip } from "./TeacherProfileSetupContext";

const Footer = styled.div<{ $setup?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
  width: 100%;
  margin-top: ${({ $setup }) => ($setup ? SPACING.EIGHT : SPACING.SIX)};

  ${({ $setup }) =>
    $setup
      ? `
    padding-top: ${SPACING.SIX};
    border-top: 1px solid ${COLORS.HEADER_BORDER_15};
  `
      : ""}

  ${LAYOUT.MEDIA.SM} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const FooterNav = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING.THREE};
  align-items: center;
`;

const SetupContinueWrap = styled.div`
  width: 100%;

  ${LAYOUT.MEDIA.SM} {
    width: auto;
  }
`;

const SetupContinueButton = styled(Button)`
  width: 100%;

  ${LAYOUT.MEDIA.SM} {
    min-width: 12rem;
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
  /** Override continue label (e.g. final step). */
  continueLabel?: string;
}

export function TeacherProfileTabFooter({
  onBack,
  continueAsSubmit = false,
  continueFormId,
  onContinue,
  isLoading = false,
  backDisabled = false,
  continueDisabled = false,
  continueLabel = "Save & Continue",
}: TeacherProfileTabFooterProps) {
  const setupMode = useTeacherProfileSetupMode();
  const onSkip = useTeacherProfileSetupSkip();
  const continueIsSubmit = continueAsSubmit || continueFormId != null;
  const backVariant = setupMode ? "ghost" : "secondary";

  return (
    <Footer $setup={setupMode}>
      <FooterNav>
        <Button
          type="button"
          variant={backVariant}
          onClick={onBack}
          disabled={backDisabled || isLoading}
        >
          Back
        </Button>
        {setupMode && onSkip ? (
          <Button type="button" variant="ghost" onClick={onSkip} disabled={isLoading}>
            Skip
          </Button>
        ) : null}
      </FooterNav>
      <SetupContinueWrap>
        <SetupContinueButton
          type={continueIsSubmit ? "submit" : "button"}
          form={continueFormId}
          variant="primary"
          isLoading={isLoading}
          disabled={continueDisabled}
          onClick={continueIsSubmit ? undefined : onContinue}
        >
          {continueLabel}
        </SetupContinueButton>
      </SetupContinueWrap>
    </Footer>
  );
}
