import type { Metadata } from "next";
import { LoginPageView } from "./LoginPageView";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <LoginPageView />;
}
