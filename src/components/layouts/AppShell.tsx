import type { ComponentProps } from "react";
import { AppShellClient } from "./AppShellClient";

export type { AppShellClientProps as AppShellProps } from "./AppShellClient";

export function AppShell(props: ComponentProps<typeof AppShellClient>) {
  return <AppShellClient {...props} />;
}
