"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { SPACING } from "@/constants/spacing.constants";
import { guardianRegisterAction, type RegisterActionResult } from "../actions";

export interface GuardianRegisterFormProps {
  defaultEmail?: string;
  defaultCode?: string;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const ErrorText = styled.p`
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.DESTRUCTIVE};
`;

const Footer = styled.p`
  text-align: center;
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const FooterLink = styled(Link)`
  font-size: ${FONTS.SIZE.SM};
  font-weight: ${FONTS.WEIGHT.SEMIBOLD};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const CodeInput = styled(Input)`
  font-family: ${FONTS.FAMILY.MONO};
  letter-spacing: 0.2em;
  text-transform: uppercase;
`;

export function GuardianRegisterForm({ defaultEmail = "", defaultCode = "" }: GuardianRegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<RegisterActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await guardianRegisterAction(fd);
      setResult(res);
      if (res.ok) {
        router.push(res.redirectTo);
        router.refresh();
      }
    });
  }

  const fieldErrors = result && !result.ok ? result.fieldErrors : undefined;

  return (
    <Form onSubmit={onSubmit}>
      <Input
        name="name"
        label="Full name"
        autoComplete="name"
        required
        minLength={2}
        error={fieldErrors?.name}
      />
      <Input
        name="email"
        type="email"
        label="Your email"
        autoComplete="email"
        required
        defaultValue={defaultEmail}
        hint="Use the same email the student invited."
        error={fieldErrors?.email}
      />
      <CodeInput
        name="inviteCode"
        label="Invite code"
        placeholder="ABC-DEF-GHJ"
        required
        defaultValue={defaultCode}
        hint="9 characters. Dashes are optional."
        error={fieldErrors?.inviteCode}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        error={fieldErrors?.password}
      />
      <Input
        name="confirmPassword"
        type="password"
        label="Confirm password"
        autoComplete="new-password"
        required
        minLength={8}
        error={fieldErrors?.confirmPassword}
      />
      {result && !result.ok && !result.fieldErrors ? (
        <ErrorText>{result.error}</ErrorText>
      ) : null}
      <Button type="submit" isLoading={isPending}>
        Create guardian account
      </Button>
      <Footer>
        Already have an account? <FooterLink href="/login">Log in</FooterLink>
      </Footer>
    </Form>
  );
}
