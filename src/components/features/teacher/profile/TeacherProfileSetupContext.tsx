"use client";

import * as React from "react";

interface TeacherProfileSetupContextValue {
  setupMode: boolean;
  onSkip?: () => void;
}

const TeacherProfileSetupContext = React.createContext<TeacherProfileSetupContextValue>({
  setupMode: false,
});

export interface TeacherProfileSetupProviderProps {
  children: React.ReactNode;
  onSkip?: () => void;
}

export function TeacherProfileSetupProvider({ children, onSkip }: TeacherProfileSetupProviderProps) {
  const value = React.useMemo(
    () => ({ setupMode: true, onSkip }),
    [onSkip],
  );

  return (
    <TeacherProfileSetupContext.Provider value={value}>{children}</TeacherProfileSetupContext.Provider>
  );
}

export function useTeacherProfileSetupMode(): boolean {
  return React.useContext(TeacherProfileSetupContext).setupMode;
}

export function useTeacherProfileSetupSkip(): (() => void) | undefined {
  return React.useContext(TeacherProfileSetupContext).onSkip;
}
