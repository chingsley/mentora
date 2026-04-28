"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  AuthAuxiliaryRow,
  AuthCheckRow,
  AuthFeedbackBanner,
  AuthFoot,
  AuthForm,
  AuthFormActions,
  AuthLink,
  AuthSubmitButton,
  AuthTextField,
} from "../AuthFormControls";
import { loginAction, type LoginActionResult } from "./actions";

export function LoginForm() {
  const router = useRouter();
  const emailId = React.useId();
  const passwordId = React.useId();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<LoginActionResult | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const globalError =
    result && !result.ok && !result.fieldErrors ? result.error : null;
  const emailError = result && !result.ok ? result.fieldErrors?.email : undefined;
  const passwordError = result && !result.ok ? result.fieldErrors?.password : undefined;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const response = await loginAction(formData);
      setResult(response);
      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <AuthForm onSubmit={onSubmit} noValidate>
      <AuthFeedbackBanner $visible={!!globalError} role="status">
        {globalError ?? ""}
      </AuthFeedbackBanner>

      <AuthTextField
        id={emailId}
        name="email"
        type="email"
        autoComplete="email"
        label="Email"
        required
        error={emailError}
      />

      <AuthTextField
        id={passwordId}
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        label="Password"
        required
        minLength={8}
        error={passwordError}
      />

      <AuthCheckRow htmlFor={`${passwordId}-show`}>
        <input
          id={`${passwordId}-show`}
          type="checkbox"
          checked={showPassword}
          onChange={(event) => setShowPassword(event.target.checked)}
        />
        <span>Show password</span>
      </AuthCheckRow>

      <AuthAuxiliaryRow>
        <AuthLink href="/login">Forgot password?</AuthLink>
      </AuthAuxiliaryRow>

      <AuthFormActions>
        <AuthSubmitButton type="submit" isLoading={isPending} size="lg">
          {isPending ? "Signing in…" : "Sign in"}
        </AuthSubmitButton>
      </AuthFormActions>

      <AuthFoot>
        New here? <AuthLink href="/register">Create an account</AuthLink>
      </AuthFoot>
    </AuthForm>
  );
}
