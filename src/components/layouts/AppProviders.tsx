"use client";

import * as React from "react";
import { NavigationLoadingProvider } from "./NavigationLoadingProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <NavigationLoadingProvider>{children}</NavigationLoadingProvider>;
}
