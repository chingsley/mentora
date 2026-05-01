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
import { TEACHER_PAYMENT_FORM_ID } from "./teacherProfileFormIds";

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

  &:focus {
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 2px ${COLORS.RING_BLACK_10};
  }
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

export interface TeacherProfilePaymentTabProps {
  payoutLegalName: string | null;
  payoutCountryCode: string | null;
  payoutPreferredMethod: string | null;
  payoutNotes: string | null;
  onAdvance: () => void;
}

export function TeacherProfilePaymentTab({
  payoutLegalName,
  payoutCountryCode,
  payoutPreferredMethod,
  payoutNotes,
  onAdvance,
}: TeacherProfilePaymentTabProps) {
  const router = useRouter();
  const [, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<ActionResult | null>(null);

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

  return (
    <Wrap>
      <Card>
        <CardHeader>
          <CardTitle>Payout readiness</CardTitle>
          <CardDescription>
            Payments are not processed in-app yet. Tell us how you plan to get paid so we can prioritize the right
            integration. Do not paste full bank or card numbers here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form id={TEACHER_PAYMENT_FORM_ID} onSubmit={onSubmit}>
            <Input
              name="payoutLegalName"
              label="Legal name (as on ID)"
              defaultValue={payoutLegalName ?? ""}
              error={errs?.payoutLegalName}
            />
            <div style={{ marginTop: SPACING.FOUR }}>
              <Input
                name="payoutCountryCode"
                label="Country code (ISO, 2 letters)"
                placeholder="e.g. NG"
                defaultValue={payoutCountryCode ?? ""}
                maxLength={2}
                error={errs?.payoutCountryCode}
              />
            </div>
            <div style={{ marginTop: SPACING.FOUR }}>
              <Select
                name="payoutPreferredMethod"
                label="Preferred payout method"
                defaultValue={payoutPreferredMethod ?? ""}
                options={PAYOUT_METHOD_OPTIONS}
                error={errs?.payoutPreferredMethod}
              />
            </div>
            <Field style={{ marginTop: SPACING.FOUR }}>
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
        </CardContent>
      </Card>
    </Wrap>
  );
}
