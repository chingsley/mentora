"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import styled from "styled-components";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { COLORS } from "@/constants/colors.constants";
import { FONTS } from "@/constants/fonts.constants";
import { LAYOUT } from "@/constants/layout.constants";
import { SPACING } from "@/constants/spacing.constants";
import { registerAction, type RegisterActionResult } from "./actions";

export interface RegionOption {
  code: string;
  name: string;
}

export interface RegisterFormProps {
  defaultRole?: "STUDENT" | "TEACHER";
  regions: RegionOption[];
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.FOUR};
`;

const Hint = styled.p`
  font-size: ${FONTS.SIZE.XS};
  color: ${COLORS.MUTED_FOREGROUND};
`;

const Inline = styled.span`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
`;

const InlineLink = styled(Link)`
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const NameGrid = styled.div`
  display: grid;
  gap: ${SPACING.FOUR};

  ${LAYOUT.MEDIA.SM} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Callout = styled.p`
  border-radius: ${LAYOUT.RADIUS.MD};
  background-color: rgba(79, 70, 229, 0.1);
  padding: ${SPACING.TWO} ${SPACING.THREE};
  font-size: ${FONTS.SIZE.SM};
  color: ${COLORS.HEADER};
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

export function RegisterForm({ defaultRole = "STUDENT", regions }: RegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<RegisterActionResult | null>(null);
  const [role, setRole] = React.useState<RegisterFormProps["defaultRole"]>(defaultRole);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await registerAction(fd);
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
      <Select
        name="role"
        label="I am signing up as"
        defaultValue={defaultRole}
        onChange={(e) => setRole(e.target.value as typeof role)}
        options={[
          { value: "STUDENT", label: "A student" },
          { value: "TEACHER", label: "A teacher" },
        ]}
      />
      <Hint>
        Signing up as a guardian? You need an invite code from your student.{" "}
        <InlineLink href="/register/guardian">Use guardian signup</InlineLink>
        <Inline>.</Inline>
      </Hint>
      <NameGrid>
        <Input
          name="firstName"
          label="First name"
          autoComplete="given-name"
          required
          minLength={2}
          error={fieldErrors?.firstName}
        />
        <Input
          name="lastName"
          label="Last name"
          autoComplete="family-name"
          required
          minLength={2}
          error={fieldErrors?.lastName}
        />
      </NameGrid>
      <Input
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        error={fieldErrors?.email}
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
      <Select
        name="regionCode"
        label="Region (optional)"
        placeholder="Select your region"
        defaultValue=""
        options={regions.map((r) => ({ value: r.code, label: r.name }))}
      />
      {role === "STUDENT" ? (
        <Callout>
          Right after sign-up you&apos;ll set up your profile: photo, a short bio,
          and the subjects you want to learn (we use this to recommend teachers).
        </Callout>
      ) : null}
      {role === "TEACHER" ? (
        <Callout>
          After sign-up you&apos;ll finish your teacher profile: photo, subjects,
          rates, and weekly schedule.
        </Callout>
      ) : null}
      {result && !result.ok && !result.fieldErrors ? (
        <ErrorText>{result.error}</ErrorText>
      ) : null}
      <Button type="submit" isLoading={isPending}>
        Create account
      </Button>
      <Footer>
        Already have an account? <InlineLink href="/login">Log in</InlineLink>
      </Footer>
    </Form>
  );
}
