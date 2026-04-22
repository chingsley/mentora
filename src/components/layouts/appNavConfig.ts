import type { Role } from "@prisma/client";

export type AppNavIconKey =
  | "dashboard"
  | "teachers"
  | "classes"
  | "schedule"
  | "guardians"
  | "policies"
  | "users"
  | "profile";

export interface AppNavItem {
  href: string;
  label: string;
  roles: readonly Role[];
  icon: AppNavIconKey;
}

export const APP_NAV: readonly AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    roles: ["ADMIN", "TEACHER", "STUDENT", "GUARDIAN"],
    icon: "dashboard",
  },
  { href: "/teachers", label: "Find teachers", roles: ["STUDENT"], icon: "teachers" },
  { href: "/classes", label: "My classes", roles: ["STUDENT"], icon: "classes" },
  { href: "/profile", label: "My profile", roles: ["TEACHER", "STUDENT"], icon: "profile" },
  { href: "/schedule", label: "My schedule", roles: ["TEACHER"], icon: "schedule" },
  { href: "/guardians", label: "Guardians", roles: ["STUDENT"], icon: "guardians" },
  { href: "/admin/policies", label: "Policies", roles: ["ADMIN"], icon: "policies" },
  { href: "/admin/users", label: "Users", roles: ["ADMIN"], icon: "users" },
] as const;
