"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  AuthFeedbackBanner,
  AuthFoot,
  AuthForm,
  AuthFormActions,
  AuthLink,
  AuthPasswordField,
  AuthSubmitButton,
  AuthTextField,
  AuthFieldGrid,
} from "../../AuthFormControls";
import { guardianRegisterAction, type RegisterActionResult } from "../actions";

export interface GuardianRegisterFormProps {
  defaultEmail?: string;
  defaultCode?: string;
}

export function GuardianRegisterForm({ defaultEmail = "", defaultCode = "" }: GuardianRegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<RegisterActionResult | null>(null);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

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
  const globalError =
    result && !result.ok && !result.fieldErrors ? result.error : null;

  return (
    <AuthForm onSubmit={onSubmit} noValidate>
      <AuthFeedbackBanner $visible={!!globalError} role="status">
        {globalError ?? ""}
      </AuthFeedbackBanner>

      <AuthTextField
        name="name"
        label="Full name"
        autoComplete="name"
        required
        minLength={2}
        error={fieldErrors?.name}
      />

      <input name="email" type="hidden" value={defaultEmail} readOnly />
      <input name="inviteCode" type="hidden" value={defaultCode} readOnly />

      <AuthFieldGrid>
        <AuthPasswordField
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          label="Password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
          error={fieldErrors?.password}
        />
        <AuthPasswordField
          name="confirmPassword"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          label="Confirm password"
          autoComplete="new-password"
          required
          minLength={8}
          error={fieldErrors?.confirmPassword}
        />
      </AuthFieldGrid>

      <AuthFormActions>
        <AuthSubmitButton type="submit" isLoading={isPending}>
          Create guardian account
        </AuthSubmitButton>
      </AuthFormActions>

      <AuthFoot>
        Already have an account? <AuthLink href="/login">Log in</AuthLink>
      </AuthFoot>
    </AuthForm>
  );
}
