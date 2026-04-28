"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  AuthCallout,
  AuthCheckRow,
  AuthFeedbackBanner,
  AuthFoot,
  AuthForm,
  AuthFormActions,
  AuthLink,
  AuthRoleRadioGroup,
  type AuthRegisterRole,
  AuthSubmitButton,
  AuthTextField,
  AuthFieldGrid,
} from "../AuthFormControls";
import { registerAction, type RegisterActionResult } from "./actions";

export interface RegisterFormProps {
  defaultRole?: AuthRegisterRole;
}

export function RegisterForm({ defaultRole = "STUDENT" }: RegisterFormProps) {
  const router = useRouter();
  const passwordId = React.useId();
  const confirmPasswordId = React.useId();
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<RegisterActionResult | null>(null);
  const [role, setRole] = React.useState<AuthRegisterRole>(defaultRole);
  const [showPassword, setShowPassword] = React.useState(false);

  const fieldErrors = result && !result.ok ? result.fieldErrors : undefined;
  const globalError =
    result && !result.ok && !result.fieldErrors ? result.error : null;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const response = await registerAction(formData);
      setResult(response);
      if (response.ok) {
        router.push(response.redirectTo);
        router.refresh();
      }
    });
  }

  return (
    <AuthForm onSubmit={onSubmit} noValidate>
      <AuthFeedbackBanner $visible={!!globalError} role="status">
        {globalError ?? ""}
      </AuthFeedbackBanner>

      <AuthRoleRadioGroup
        legend="I am signing up as"
        value={role}
        onChange={setRole}
        error={fieldErrors?.role}
      />

      {role === "GUARDIAN" ? (
        <AuthCallout>
          Guardians need an invite from a student.{" "}
          <AuthLink href="/register/guardian">Use the guardian signup page</AuthLink> with your
          invite code.
        </AuthCallout>
      ) : null}
      <AuthTextField
        name="name"
        label="Full name"
        autoComplete="name"
        required
        minLength={2}
        error={fieldErrors?.name}
      />

      <AuthTextField
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        required
        error={fieldErrors?.email}
      />

      <AuthFieldGrid>
        <AuthTextField
          id={passwordId}
          name="password"
          type={showPassword ? "text" : "password"}
          label="Password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
          error={fieldErrors?.password}
        />
        <AuthTextField
          id={confirmPasswordId}
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          label="Confirm password"
          autoComplete="new-password"
          required
          minLength={8}
          error={fieldErrors?.confirmPassword}
        />
      </AuthFieldGrid>

      <AuthCheckRow htmlFor={`${passwordId}-show`}>
        <input
          id={`${passwordId}-show`}
          type="checkbox"
          checked={showPassword}
          onChange={(event) => setShowPassword(event.target.checked)}
        />
        <span>Show passwords</span>
      </AuthCheckRow>

      {/* {role === "STUDENT" ? (
        <AuthCallout>
          Right after sign-up you&apos;ll set up your profile: photo, a short bio,
          and the subjects you want to learn.
        </AuthCallout>
      ) : null} */}

      {/* {role === "TEACHER" ? (
        <AuthCallout>
          After sign-up you&apos;ll finish your teacher profile: photo, teaching region,
          subjects, rates, and weekly schedule.
        </AuthCallout>
      ) : null} */}

      <AuthFormActions>
        <AuthSubmitButton type="submit" isLoading={isPending} size="lg">
          {isPending ? "Creating account…" : "Create account"}
        </AuthSubmitButton>
      </AuthFormActions>

      <AuthFoot>
        Already have an account? <AuthLink href="/login">Log in</AuthLink>
      </AuthFoot>
    </AuthForm>
  );
}
