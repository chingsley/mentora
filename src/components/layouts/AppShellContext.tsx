"use client";

import type { Role } from "@prisma/client";
import * as React from "react";

export interface AppShellUser {
  name?: string | null;
  email?: string | null;
  role: Role;
}

const AppShellContext = React.createContext<AppShellUser | null>(null);

export interface AppShellProviderProps {
  user: AppShellUser;
  children: React.ReactNode;
}

export function AppShellProvider({ user, children }: AppShellProviderProps) {
  return <AppShellContext.Provider value={user}>{children}</AppShellContext.Provider>;
}

export function useAppShell(): AppShellUser {
  const value = React.useContext(AppShellContext);
  if (!value) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }
  return value;
}
