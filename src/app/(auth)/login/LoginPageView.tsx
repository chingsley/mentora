"use client";

import { AuthPageFrame } from "../AuthPageFrame";
import { LoginForm } from "./LoginForm";

export function LoginPageView() {
  return (
    <AuthPageFrame title="Sign in" lead="Sign in with your email and password.">
      <LoginForm />
    </AuthPageFrame>
  );
}
