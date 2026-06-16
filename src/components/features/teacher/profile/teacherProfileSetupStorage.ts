import {
  TEACHER_SETUP_DISMISS_STORAGE_KEY,
  TEACHER_SETUP_WELCOME_SEEN_STORAGE_KEY,
} from "./teacherProfileSetup.constants";

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string): void {
  try {
    localStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

function removeFlag(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function readWelcomeSeen(): boolean {
  return readFlag(TEACHER_SETUP_WELCOME_SEEN_STORAGE_KEY);
}

export function markWelcomeSeen(): void {
  writeFlag(TEACHER_SETUP_WELCOME_SEEN_STORAGE_KEY);
}

export function readSetupDismissed(): boolean {
  return readFlag(TEACHER_SETUP_DISMISS_STORAGE_KEY);
}

export function markSetupDismissed(): void {
  writeFlag(TEACHER_SETUP_DISMISS_STORAGE_KEY);
}

export function clearSetupDismissed(): void {
  removeFlag(TEACHER_SETUP_DISMISS_STORAGE_KEY);
}
