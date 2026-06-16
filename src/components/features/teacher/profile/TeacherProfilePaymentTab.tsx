"use client";

import { saveTeacherPayoutTabAction, type ActionResult } from "@/app/(app)/profile/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import { TEACHER_PAYOUT_METHOD } from "@/constants/teacherPayout.constants";
import { TEACHER_PAYMENT_FORM_ID } from "./teacherProfileFormIds";
import { TeacherProfileTabFooter } from "./TeacherProfileTabFooter";
import { useTeacherProfileSetupMode } from "./TeacherProfileSetupContext";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.SIX};
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const FieldLabel = styled.span`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const Textarea = styled.textarea`
  min-height: 5rem;
  width: 100%;
  border-radius: ${FORM_FIELD.CONTROL_RADIUS};
  border: ${formFieldControlBorder(false)};
  background-color: ${COLORS.FOREGROUND};
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.TEXT};
  outline: none;
  resize: vertical;

  &::placeholder {
    color: ${FORM_FIELD.PLACEHOLDER_COLOR};
    font-weight: ${FONTS.WEIGHT.NORMAL};
  }

  &:focus {
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
`;

const SetupDisclaimer = styled.p`
  margin: 0 0 ${SPACING.FIVE};
  font-size: ${FONTS.SIZE.SM};
  line-height: ${FONTS.LINE_HEIGHT.RELAXED};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const PAYOUT_METHOD_OPTIONS = [
  { value: "", label: "Not sure yet" },
  { value: "BANK_TRANSFER", label: "Bank transfer (when available)" },
  { value: "STRIPE_CONNECT", label: "Stripe / Connect-style payout" },
  { value: "OTHER", label: "Other / discuss with support" },
];

const BankFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

export interface TeacherProfilePaymentTabProps {
  payoutLegalName: string | null;
  payoutCountryCode: string | null;
  payoutPreferredMethod: string | null;
  payoutBankName: string | null;
  payoutBankBranch: string | null;
  payoutBankAccountNumber: string | null;
  payoutBankRoutingNumber: string | null;
  payoutNotes: string | null;
  onAdvance: () => void;
  onBack: () => void;
}

export function TeacherProfilePaymentTab({
  payoutLegalName,
  payoutCountryCode,
  payoutPreferredMethod,
  payoutBankName,
  payoutBankBranch,
  payoutBankAccountNumber,
  payoutBankRoutingNumber,
  payoutNotes,
  onAdvance,
  onBack,
}: TeacherProfilePaymentTabProps) {
  const router = useRouter();
  const setupMode = useTeacherProfileSetupMode();
  const [isSaving, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);
  const [preferredMethod, setPreferredMethod] = React.useState(payoutPreferredMethod ?? "");
  const isBankTransfer = preferredMethod === TEACHER_PAYOUT_METHOD.BANK_TRANSFER;

  React.useEffect(() => {
    setPreferredMethod(payoutPreferredMethod ?? "");
  }, [payoutPreferredMethod]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveTeacherPayoutTabAction(fd);
      setResult(res);
      if (res.ok) {
        router.refresh();
        onAdvance();
      }
    });
  }

  const errs = result && !result.ok ? result.fieldErrors : undefined;

  const paymentForm = (
    <Form id={TEACHER_PAYMENT_FORM_ID} onSubmit={onSubmit}>
      {setupMode ? (
        <SetupDisclaimer>
          Payments are not processed in-app yet. Share payout preferences and, if you choose bank transfer,
          the account details we need to pay you.
        </SetupDisclaimer>
      ) : null}
      <Input
        name="payoutLegalName"
        label="Legal name (as on ID)"
        defaultValue={payoutLegalName ?? ""}
        error={errs?.payoutLegalName}
      />
      <Input
        name="payoutCountryCode"
        label="Country code (ISO, 2 letters)"
        placeholder="e.g. NG"
        defaultValue={payoutCountryCode ?? ""}
        maxLength={2}
        error={errs?.payoutCountryCode}
      />
      <Select
        name="payoutPreferredMethod"
        label="Preferred payout method"
        value={preferredMethod}
        onChange={(e) => setPreferredMethod(e.currentTarget.value)}
        options={PAYOUT_METHOD_OPTIONS}
        error={errs?.payoutPreferredMethod}
      />
      {isBankTransfer ? (
        <BankFields>
          <Input
            name="payoutBankName"
            label="Bank name"
            defaultValue={payoutBankName ?? ""}
            error={errs?.payoutBankName}
          />
          <Input
            name="payoutBankBranch"
            label="Branch"
            defaultValue={payoutBankBranch ?? ""}
            error={errs?.payoutBankBranch}
          />
          <Input
            name="payoutBankAccountNumber"
            label="Account number"
            defaultValue={payoutBankAccountNumber ?? ""}
            autoComplete="off"
            error={errs?.payoutBankAccountNumber}
          />
          <Input
            name="payoutBankRoutingNumber"
            label="Routing number (optional)"
            defaultValue={payoutBankRoutingNumber ?? ""}
            autoComplete="off"
            error={errs?.payoutBankRoutingNumber}
          />
        </BankFields>
      ) : null}
      <Field>
        <FieldLabel>Notes for finance / support</FieldLabel>
        <Textarea
          name="payoutNotes"
          defaultValue={payoutNotes ?? ""}
          maxLength={5000}
          placeholder="e.g. Preferred currency, tax ID type, timing constraints…"
        />
        {errs?.payoutNotes ? <ErrorText>{errs.payoutNotes}</ErrorText> : null}
      </Field>
      {result && !result.ok && !result.fieldErrors ? <ErrorText>{result.error}</ErrorText> : null}
    </Form>
  );

  return (
    <Wrap>
      {setupMode ? (
        paymentForm
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payout readiness</CardTitle>
            <CardDescription>
              Payments are not processed in-app yet. Tell us how you plan to get paid so we can prioritize the
              right integration. If you choose bank transfer, add the account details below.
            </CardDescription>
          </CardHeader>
          <CardContent>{paymentForm}</CardContent>
        </Card>
      )}
      <TeacherProfileTabFooter
        onBack={onBack}
        continueFormId={TEACHER_PAYMENT_FORM_ID}
        isLoading={isSaving}
        continueLabel={setupMode ? "Finish setup" : undefined}
      />
    </Wrap>
  );
}
