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
import { loginAction, type LoginActionResult } from "./actions";

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
  font-weight: ${FONTS.WEIGHT.MEDIUM};
  color: ${COLORS.HEADER};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<LoginActionResult | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await loginAction(fd);
      setResult(res);
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <Form onSubmit={onSubmit}>
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
        error={result && !result.ok ? result.fieldErrors?.email : undefined}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        required
        minLength={8}
        error={result && !result.ok ? result.fieldErrors?.password : undefined}
      />
      {result && !result.ok && !result.fieldErrors ? (
        <ErrorText>{result.error}</ErrorText>
      ) : null}
      <Button type="submit" isLoading={isPending}>
        Log in
      </Button>
      <Footer>
        New here? <FooterLink href="/register">Create an account</FooterLink>
      </Footer>
    </Form>
  );
}
