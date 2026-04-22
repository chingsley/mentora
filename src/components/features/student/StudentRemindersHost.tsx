"use client";

import { useClassReminders } from "@/hooks/useClassReminders";

export interface StudentRemindersHostProps {
  studentName: string;
}

export function StudentRemindersHost({ studentName }: StudentRemindersHostProps) {
  useClassReminders({ enabled: true, studentName });
  return null;
}
