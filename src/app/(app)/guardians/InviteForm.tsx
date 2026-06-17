"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AUTH } from "@/constants/auth.constants";
import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD } from "@/constants/formField.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { inviteGuardianAction, type InviteGuardianResult } from "./actions";

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.THREE};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.ONE};
  width: 100%;
  max-width: ${AUTH.CARD_MAX_WIDTH};
`;

const Field = styled.div`
  width: 100%;
`;

const SubmitButton = styled(Button)`
  width: 100%;
  min-height: ${FORM_FIELD.CONTROL_MIN_HEIGHT};
`;

const Callout = styled.div`
  border-radius: ${LAYOUT.RADIUS.MD};
  border: 1px solid ${COLORS.BORDER};
  background-color: ${COLORS.BACKGROUND};
  padding: ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
`;

const CalloutTitle = styled.p`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const CalloutBody = styled.p`
  margin-top: ${SPACING.ONE};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const CodeText = styled.span`
  font-family: ${FONTS.FAMILY.MONO};
`;

const CodeBlock = styled.p`
  margin-top: ${SPACING.TWO};
  font-family: ${FONTS.FAMILY.MONO};
  font-size: ${FONTS.SIZE.LG};
  letter-spacing: 0.15em;
  color: ${COLORS.HEADER};
`;

const Hint = styled.p`
  margin-top: ${SPACING.ONE};
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.DESTRUCTIVE};
`;

export function InviteForm() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<InviteGuardianResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await inviteGuardianAction(fd);
      setResult(res);
      if (res.ok) {
        form.reset();
        router.refresh();
      }
    });
  }

  const err = result && !result.ok ? result.fieldErrors?.guardianEmail : undefined;

  return (
    <Wrap>
      <Form onSubmit={onSubmit}>
        <Field>
          <Input
            name="guardianEmail"
            type="email"
            label="Guardian email"
            placeholder="guardian@example.com"
            required
            error={err}
          />
        </Field>
        <SubmitButton type="submit" isLoading={isPending}>
          Send Invite
        </SubmitButton>
      </Form>

      {result?.ok ? (
        <Callout>
          <CalloutTitle>Invite sent to {result.guardianEmail}</CalloutTitle>
          <CalloutBody>
            Ask your guardian to sign up at{" "}
            <CodeText>/register/guardian</CodeText> and enter the code below:
          </CalloutBody>
          <CodeBlock>{result.formattedCode}</CodeBlock>
          <Hint>The code is also in the email we just sent them.</Hint>
        </Callout>
      ) : null}

      {result && !result.ok && !result.fieldErrors ? (
        <ErrorText>{result.error}</ErrorText>
      ) : null}
    </Wrap>
  );
}
